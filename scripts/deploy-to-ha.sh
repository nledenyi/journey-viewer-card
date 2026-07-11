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
#   4. Bump the ?v= cache-bust on the resource entry via the HA WebSocket API.
#      This is the only method that applies live in storage mode: editing
#      /config/.storage/lovelace_resources directly only takes effect after an
#      HA restart (HA keeps the list in memory), and lovelace.reload_resources
#      exists only for YAML-mode resources.
#
# Run from the project root:  ./scripts/deploy-to-ha.sh
# Requires sudo to talk to qm. Step 4 needs the python3 `websockets` package
# on this host plus DEV_HA_URL + DEV_HA_TOKEN in .env.local (same values the
# dev harness uses); without them it falls back to printing manual steps.

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

# 4. Bump the ?v=N cache-bust on the resource entry via the WebSocket API
#    so it applies immediately (memory + storage stay in sync). Inserts a
#    ?v=1 if the URL has no version yet.
if [ -f .env.local ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env.local
  set +a
fi
if [ -z "${DEV_HA_URL:-}" ] || [ -z "${DEV_HA_TOKEN:-}" ]; then
  echo "[deploy] DEV_HA_URL / DEV_HA_TOKEN not set - bump the resource manually:"
  echo "[deploy]   Settings > Dashboards > (three-dot menu) > Resources > edit the ${CARD_NAME} URL"
else
  python3 - "$CARD_NAME" <<'PYEOF'
import json, os, sys
from websockets.sync.client import connect

card = sys.argv[1]
base_url = os.environ["DEV_HA_URL"].rstrip("/")
ws_url = base_url.replace("https://", "wss://", 1).replace("http://", "ws://", 1) + "/api/websocket"

with connect(ws_url) as ws:
    json.loads(ws.recv())  # auth_required
    ws.send(json.dumps({"type": "auth", "access_token": os.environ["DEV_HA_TOKEN"]}))
    msg = json.loads(ws.recv())
    if msg.get("type") != "auth_ok":
        sys.exit(f"[deploy] WS auth failed: {msg}")

    ws.send(json.dumps({"id": 1, "type": "lovelace/resources"}))
    resources = json.loads(ws.recv())["result"]
    entry = next((r for r in resources if card in r["url"]), None)
    if entry is None:
        sys.exit(f"[deploy] WARNING: no {card} entry in lovelace resources")

    base, _, v = entry["url"].partition("?v=")
    new_url = f"{base}?v={int(v) + 1 if v else 1}"
    ws.send(json.dumps({
        "id": 2,
        "type": "lovelace/resources/update",
        "resource_id": entry["id"],
        "url": new_url,
        "res_type": entry["type"],
    }))
    resp = json.loads(ws.recv())
    if not resp.get("success"):
        sys.exit(f"[deploy] Resource update failed: {resp}")
    print(f"[deploy] Resource bumped live: {new_url}")
PYEOF
fi

echo "[deploy] Done. Hard-refresh the dashboard (Ctrl+Shift+R) to pick up the new bundle."
