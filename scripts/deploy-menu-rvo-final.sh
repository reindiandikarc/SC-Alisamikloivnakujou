#!/usr/bin/env bash
# Deploy final batch: RVO early-resend + relay + menu kategori (rich & teks).
set -euo pipefail

MACHINE="m_agralfkf6q2p3lxe7z6jrfosv4"
LOCAL="/data/workspace/SC-Alisamikloivnakujou"
REMOTE="/data/home/SC-Alisamikloivnakujou"
export INSTABOX_API_KEY="$(cat /data/home/.instabox_key)"

FILES=(
  "index.js"
  "plugins/cmd_registry.json"
  "plugins/cmd/antigravity.js"
  "plugins/cmd/uimode.js"
  "plugins/cmd/readviewonce.js"
  "plugins/cmd/ownermenu.js"
  "plugins/cmd/menu.js"
  "plugins/cmd/allmenu.js"
  "plugins/cmd/othermenu.js"
  "plugins/cmd/rpgmenu.js"
  "lib/listmenu.js"
  "lib/richmenu.js"
  "lib/rvo-placeholder.js"
  "lib/rvo-relay.js"
  "node_modules/@whiskeysockets/baileys/src/Socket/messages-recv.js"
  "node_modules/@whiskeysockets/baileys/src/index.bundle.cjs"
  "node_modules/@whiskeysockets/baileys/src/Utils/decode-wa-message.js"
)

echo "== Backup runtime =="
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP="/data/home/sc-finalrvo-backup-$STAMP"
instabox exec "$MACHINE" -- bash -lc "mkdir -p '$BACKUP' && cd '$REMOTE' && for f in ${FILES[*]}; do if [ -f \"\$f\" ]; then mkdir -p \"$BACKUP/\$(dirname \"\$f\")\"; cp -a \"\$f\" \"$BACKUP/\$f\"; fi; done && echo BACKUP_OK=$BACKUP"

echo "== Push file =="
for f in "${FILES[@]}"; do
  if [ ! -f "$LOCAL/$f" ]; then echo "MISSING LOCAL: $f"; exit 1; fi
  instabox cp "$LOCAL/$f" "$MACHINE:$REMOTE/$f" >/dev/null
  echo "  ok $f"
done

echo "== Restart service =="
instabox exec "$MACHINE" -- bash -lc "sudo systemctl restart alya-bot && sleep 18 && systemctl is-active alya-bot"

echo "== Hash check =="
for f in "${FILES[@]}"; do
  LH="$(sha256sum "$LOCAL/$f" | awk '{print $1}')"
  RH="$(instabox exec "$MACHINE" -- bash -lc "sha256sum '$REMOTE/$f'" | awk '{print $1}')"
  if [ "$LH" = "$RH" ]; then echo "  MATCH $f"; else echo "  MISMATCH $f ($LH != $RH)"; exit 1; fi
done

echo "== Runtime sanity =="
instabox exec "$MACHINE" -- bash -lc "cd '$REMOTE' && printf 'uimode=' && cat database/uimode.json | tr -d '\n' && printf '\nearly_rvo_markers=' && grep -c 'ALYA_V13_EARLY_RVO_PATCH' node_modules/@whiskeysockets/baileys/src/Socket/messages-recv.js; journalctl -u alya-bot --since '2 min ago' --no-pager 2>/dev/null | grep -c -iE 'error|uncaught|crash' || true"

echo "DEPLOY_OK"
