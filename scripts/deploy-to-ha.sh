#!/usr/bin/env bash
# Maintainer-only deploy helper: assumes Home Assistant OS running in a
# Proxmox QEMU VM reachable from this host (`qm guest exec`). If that's not
# your setup, use the manual install steps in README.md instead.
#
# Deploy dist/journey-viewer-card.js into HA OS (VM $HA_VMID) via the PVE host.
#
# Steps:
#   1. Validate the build output exists
#   2. Push the file in 50 KB base64 chunks (qm guest exec arg-list cap ~128 KB)
#   3. Verify the byte count matches on both ends
#   4. Bump ?v= cache-bust on the lovelace_resources entry
#   5. Reload Lovelace so the new resource version is fetched
#
# Run from the project root:  ./scripts/deploy-to-ha.sh
# Requires sudo to talk to qm.

set -euo pipefail

CARD_NAME="journey-viewer-card"
SRC="dist/${CARD_NAME}.js"
DST_DIR="/config/www/community/${CARD_NAME}"
DST_FILE="${DST_DIR}/${CARD_NAME}.js"
VMID="${HA_VMID:-101}"

if [ ! -f "$SRC" ]; then
  echo "Build output not found at $SRC. Run 'npm run build' first." >&2
  exit 1
fi
LOCAL_SIZE=$(stat -c '%s' "$SRC")
echo "[deploy] Pushing $SRC ($LOCAL_SIZE bytes) to VM $VMID:$DST_FILE"

# 1. Ensure target dir exists, truncate the destination.
sudo qm guest exec "$VMID" -- docker exec homeassistant sh -c \
  "mkdir -p '$DST_DIR' && : > '$DST_FILE'" >/dev/null

# 2. Stream in 50 KB chunks.
CHUNK_DIR=$(mktemp -d)
trap 'rm -rf "$CHUNK_DIR"' EXIT
split -b 50000 "$SRC" "$CHUNK_DIR/chunk-"
COUNT=$(ls "$CHUNK_DIR" | wc -l)
i=0
for f in "$CHUNK_DIR"/chunk-*; do
  i=$((i + 1))
  printf "[deploy] chunk %d/%d\r" "$i" "$COUNT"
  B64=$(base64 -w0 < "$f")
  sudo qm guest exec "$VMID" -- docker exec homeassistant sh -c \
    "echo '$B64' | base64 -d >> '$DST_FILE'" >/dev/null
done
echo

# 3. Verify size matches.
REMOTE_SIZE=$(sudo qm guest exec "$VMID" -- docker exec homeassistant \
  stat -c '%s' "$DST_FILE" 2>/dev/null \
  | python3 -c 'import json,sys;print(json.load(sys.stdin)["out-data"].strip())')
if [ "$LOCAL_SIZE" != "$REMOTE_SIZE" ]; then
  echo "[deploy] FAILED: local=$LOCAL_SIZE remote=$REMOTE_SIZE" >&2
  exit 1
fi
echo "[deploy] Size verified: $REMOTE_SIZE bytes"

# 4. Bump the ?v=N cache-bust on the lovelace_resources entry. Insert a
#    placeholder ?v=1 if the URL has no version yet.
sudo qm guest exec "$VMID" -- docker exec homeassistant python3 -c "
import json, sys
path = '/config/.storage/lovelace_resources'
with open(path) as f:
    d = json.load(f)
changed = False
for r in d['data']['items']:
    url = r.get('url', '')
    if '${CARD_NAME}' not in url:
        continue
    if '?v=' in url:
        base, v = url.split('?v=')
        url = f'{base}?v={int(v) + 1}'
    else:
        url = f'{url}?v=1'
    r['url'] = url
    changed = True
    print(f'[deploy] Bumped resource: {url}')
if not changed:
    print('[deploy] WARNING: no ${CARD_NAME} entry in lovelace_resources', file=sys.stderr)
    sys.exit(2)
with open(path, 'w') as f:
    json.dump(d, f, indent=2)
" >/dev/null

# 5. Reload core config so the new resource URL is picked up. (A frontend
#    reload is enough; we don't need to restart HA.)
sudo qm guest exec "$VMID" -- docker exec homeassistant python3 -c "
import requests, os
url = 'http://localhost:8123/api/services/lovelace/reload_resources'
token = os.environ.get('SUPERVISOR_TOKEN', '')
# Best-effort; if SUPERVISOR_TOKEN isn't set in this container, just print.
if not token:
    print('[deploy] Reload manually: Settings > Dashboards > Resources > Reload')
else:
    requests.post(url, headers={'Authorization': f'Bearer {token}'})
    print('[deploy] Lovelace resources reloaded')
" >/dev/null || true

echo "[deploy] Done. Hard-refresh the dashboard (Ctrl+Shift+R) to pick up the new bundle."
