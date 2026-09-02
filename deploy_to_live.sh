#!/usr/bin/env bash
set -euo pipefail

# Deploy Hebert Labs on the VPS: pull main, build Astro, publish dist/ to Nginx.
# Run from the repo root on the server. No Node process is needed in production.
#
# Usage:
#   ./deploy_to_live.sh
#   SKIP_GIT=1 ./deploy_to_live.sh          # rebuild and publish without pulling
#   LIVE_DIR=/var/www/example ./deploy_to_live.sh
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

fix_permissions() {
  local target="$1"
  echo "[deploy] Setting permissions on $target ..."
  find "$target" -type d -exec chmod 755 {} +
  find "$target" -type f -exec chmod 644 {} +
  if [ -n "$NGINX_USER" ]; then
    chown -R "$NGINX_USER:$NGINX_USER" "$target"
  fi
}

publish_with_rsync() {
  mkdir -p "$LIVE_DIR"
  # .well-known is the ACME webroot, not build output. Letting --delete near it
  # silently breaks Let's Encrypt renewal.
  rsync -av --delete --exclude='.well-known' "$BUILD_DIR/" "$LIVE_DIR/"
}

publish_with_stage_swap() {
  local stage_dir previous_dir
  stage_dir="$(mktemp -d "${LIVE_DIR}.stage.XXXXXX")"
  previous_dir="${LIVE_DIR}.previous.$$"

  restore() {
    if [ -d "$previous_dir" ] && [ ! -e "$LIVE_DIR" ]; then
      mv "$previous_dir" "$LIVE_DIR"
    fi
    rm -rf "$stage_dir"
  }
  trap restore EXIT

  # mktemp -d makes the directory 0700, which would hide the site from Nginx.
  chmod 755 "$stage_dir"
  cp -a "$BUILD_DIR/." "$stage_dir/"

  # Carry the ACME webroot across the swap for the same reason as rsync --exclude.
  if [ -d "$LIVE_DIR/.well-known" ]; then
    cp -a "$LIVE_DIR/.well-known" "$stage_dir/"
  fi

  mkdir -p "$(dirname "$LIVE_DIR")"
  if [ -d "$LIVE_DIR" ]; then
    mv "$LIVE_DIR" "$previous_dir"
  fi
  mv "$stage_dir" "$LIVE_DIR"

  trap - EXIT
  rm -rf "$previous_dir"
}

echo "[deploy] Publishing $BUILD_DIR to $LIVE_DIR ..."
if command -v rsync >/dev/null 2>&1; then
  publish_with_rsync
else
  echo "[deploy] rsync not found; using stage-and-swap cp fallback"
  publish_with_stage_swap
fi

fix_permissions "$LIVE_DIR"

echo "[deploy] Done. Verify with: curl -I https://hebertlabs.com/"
