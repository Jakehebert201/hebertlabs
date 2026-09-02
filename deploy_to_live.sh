#!/usr/bin/env bash
set -euo pipefail

# Deploy Hebert Labs on the VPS: pull main, build Astro, publish dist/ to Nginx.
# Run from the repo root on the server. No Node process is needed in production.
#
# Usage:
#   ./deploy_to_live.sh
#   SKIP_GIT=1 ./deploy_to_live.sh          # rebuild and publish without pulling
#   LIVE_DIR=/var/www/example ./deploy_to_live.sh
#   USE_SUDO=1 ./deploy_to_live.sh          # publish when LIVE_DIR is not writable
#   sudo ./deploy_to_live.sh                # same as USE_SUDO=1 for the publish step
#   NGINX_USER=www-data sudo -E ./deploy_to_live.sh   # chown after publish (implies USE_SUDO)
#
# Staging (cp fallback) uses $TMPDIR, /tmp, or .deploy-stage/ in the repo — never
# under /var/www/. Publishing to LIVE_DIR may require sudo if your user cannot
# write /var/www/hebertlabs (common when the docroot is owned by www-data).
#
# See deploy/nginx-hebertlabs.conf.example for the expected Nginx server block.

# --- configuration (override via environment) ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="${REPO_DIR:-$SCRIPT_DIR}"
LIVE_DIR="${LIVE_DIR:-/var/www/hebertlabs}"
BUILD_DIR="$REPO_DIR/dist"
BRANCH="${BRANCH:-main}"
# Set to www-data (Debian/Ubuntu) or nginx (RHEL) to chown after publish. Requires root.
NGINX_USER="${NGINX_USER:-}"
SKIP_GIT="${SKIP_GIT:-0}"
USE_SUDO="${USE_SUDO:-0}"

# chown requires root; treat NGINX_USER as an explicit request to elevate publish.
if [ -n "$NGINX_USER" ]; then
  USE_SUDO=1
fi

cd "$REPO_DIR"

if [ "$SKIP_GIT" != "1" ]; then
  echo "[deploy] Fetching latest from origin/$BRANCH..."
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git pull --ff-only origin "$BRANCH"
else
  echo "[deploy] SKIP_GIT=1 — using the working tree as-is."
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "[deploy] ERROR: npm not found. Install Node.js 20+ on this server first." >&2
  exit 1
fi

echo "[deploy] Installing dependencies..."
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

echo "[deploy] Building site..."
npm run build

if [ ! -d "$BUILD_DIR" ]; then
  echo "[deploy] ERROR: build finished but $BUILD_DIR does not exist." >&2
  exit 1
fi

if [ -z "$(ls -A "$BUILD_DIR")" ]; then
  echo "[deploy] ERROR: $BUILD_DIR is empty; refusing to publish." >&2
  exit 1
fi

live_parent() {
  dirname "$LIVE_DIR"
}

maybe_sudo() {
  if [ "$USE_SUDO" = "1" ]; then
    sudo "$@"
  else
    "$@"
  fi
}

can_write_live_parent() {
  local parent
  parent="$(live_parent)"
  [ -d "$parent" ] && [ -w "$parent" ]
}

can_write_live_dir() {
  if [ -d "$LIVE_DIR" ] && [ -w "$LIVE_DIR" ]; then
    return 0
  fi
  can_write_live_parent
}

require_publish_access() {
  local mode="${1:-stage_swap}"

  if [ "$USE_SUDO" = "1" ]; then
    return 0
  fi

  if [ "$mode" = "rsync" ]; then
    if can_write_live_dir; then
      return 0
    fi
  elif can_write_live_parent; then
    return 0
  fi

  echo "[deploy] ERROR: no write access to publish into $LIVE_DIR." >&2
  echo "[deploy] Your user cannot write $(live_parent) (or $LIVE_DIR is not writable)." >&2
  echo "[deploy] Run: sudo ./deploy_to_live.sh   or   USE_SUDO=1 ./deploy_to_live.sh" >&2
  echo "[deploy] Alternatively, grant write access (e.g. chown/chmod or add user to www-data)." >&2
  exit 1
}

writable_temp_base() {
  if [ -n "${TMPDIR:-}" ] && [ -d "$TMPDIR" ] && [ -w "$TMPDIR" ]; then
    printf '%s' "${TMPDIR%/}"
    return 0
  fi
  if [ -d /tmp ] && [ -w /tmp ]; then
    printf '%s' /tmp
    return 0
  fi
  local repo_stage="$REPO_DIR/.deploy-stage"
  mkdir -p "$repo_stage"
  printf '%s' "$repo_stage"
}

make_stage_dir() {
  local prefix="${1:-hebertlabs-deploy}"
  mktemp -d "$(writable_temp_base)/${prefix}.XXXXXX"
}

fix_permissions() {
  local target="$1"
  echo "[deploy] Setting permissions on $target ..."
  if [ "$USE_SUDO" = "1" ]; then
    sudo find "$target" -type d -exec chmod 755 {} +
    sudo find "$target" -type f -exec chmod 644 {} +
    if [ -n "$NGINX_USER" ]; then
      sudo chown -R "$NGINX_USER:$NGINX_USER" "$target"
    fi
  else
    find "$target" -type d -exec chmod 755 {} +
    find "$target" -type f -exec chmod 644 {} +
    if [ -n "$NGINX_USER" ]; then
      chown -R "$NGINX_USER:$NGINX_USER" "$target"
    fi
  fi
}

publish_with_rsync() {
  require_publish_access rsync
  maybe_sudo mkdir -p "$LIVE_DIR"
  maybe_sudo rsync -av --delete --exclude='.well-known' "$BUILD_DIR/" "$LIVE_DIR/"
}

publish_inplace_cp() {
  # When LIVE_DIR is writable but /var/www is not, we cannot rename directories
  # for a swap — update files in place instead (same outcome for a static site).
  require_publish_access rsync

  maybe_sudo mkdir -p "$LIVE_DIR"

  echo "[deploy] Updating $LIVE_DIR in place (no write access to $(live_parent)) ..."
  find "$LIVE_DIR" -mindepth 1 -maxdepth 1 ! -name '.well-known' -exec rm -rf {} +
  cp -a "$BUILD_DIR/." "$LIVE_DIR/"
}

publish_with_stage_swap() {
  local stage_dir previous_dir

  if can_write_live_dir && ! can_write_live_parent; then
    publish_inplace_cp
    return
  fi

  stage_dir="$(make_stage_dir hebertlabs-deploy)"
  previous_dir="$(make_stage_dir hebertlabs-previous)"

  require_publish_access stage_swap

  restore() {
    if [ -d "$previous_dir" ] && [ ! -e "$LIVE_DIR" ]; then
      maybe_sudo mv "$previous_dir" "$LIVE_DIR"
    fi
    rm -rf "$stage_dir" "$previous_dir"
  }
  trap restore EXIT

  # mktemp -d makes the directory 0700, which would hide the site from Nginx.
  chmod 755 "$stage_dir"
  cp -a "$BUILD_DIR/." "$stage_dir/"

  # Carry the ACME webroot across the swap for the same reason as rsync --exclude.
  if [ -d "$LIVE_DIR/.well-known" ]; then
    cp -a "$LIVE_DIR/.well-known" "$stage_dir/"
  fi

  maybe_sudo mkdir -p "$(live_parent)"
  if [ -d "$LIVE_DIR" ]; then
    maybe_sudo mv "$LIVE_DIR" "$previous_dir"
  fi
  maybe_sudo mv "$stage_dir" "$LIVE_DIR"

  trap - EXIT
  rm -rf "$previous_dir"
}

echo "[deploy] Publishing $BUILD_DIR to $LIVE_DIR ..."
if command -v rsync >/dev/null 2>&1; then
  publish_with_rsync
else
  echo "[deploy] rsync not found; using stage-and-swap cp fallback"
  echo "[deploy] Hint: install rsync for faster deploys (Debian/Ubuntu: sudo apt install rsync)"
  publish_with_stage_swap
fi

fix_permissions "$LIVE_DIR"

echo "[deploy] Done. Verify with: curl -I https://hebertlabs.com/"
