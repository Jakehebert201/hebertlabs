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
# Exclude git metadata and this deploy script from live root
rsync -av --delete \
  --exclude '.git' \
  --exclude '.github' \
  --exclude 'deploy_to_live.sh' \
  "$REPO_DIR/" "$LIVE_DIR/"

echo "[deploy] Done."
