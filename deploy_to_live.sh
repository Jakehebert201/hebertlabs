#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/home/jake/.openclaw/workspace/hebertlabs"
LIVE_DIR="/var/www/hebertlabs"
BRANCH="main"

cd "$REPO_DIR"

echo "[deploy] Fetching latest from origin/$BRANCH..."
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "[deploy] Syncing files to $LIVE_DIR ..."
# Prefer rsync when available; fallback to cp-based sync if not installed.
if command -v rsync >/dev/null 2>&1; then
  rsync -av --delete \
    --exclude '.git' \
    --exclude '.github' \
    --exclude 'deploy_to_live.sh' \
    "$REPO_DIR/" "$LIVE_DIR/"
else
  echo "[deploy] rsync not found; using cp fallback"

  # Remove existing files/dirs in live dir except protected entries.
  find "$LIVE_DIR" -mindepth 1 \
    ! -name '.git' \
    ! -name '.github' \
    ! -name 'deploy_to_live.sh' \
    -exec rm -rf {} +

  # Copy tracked website files.
  cp -a "$REPO_DIR/." "$LIVE_DIR/"

  # Ensure excluded items are not left in live root.
  rm -rf "$LIVE_DIR/.git" "$LIVE_DIR/.github" "$LIVE_DIR/deploy_to_live.sh"
fi

echo "[deploy] Done."
