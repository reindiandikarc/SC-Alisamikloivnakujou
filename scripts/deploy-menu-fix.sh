#!/usr/bin/env bash
# Deploy perbaikan menu/registry/swgc ke runtime bot.
# Dipakai setelah 4 agen implementasi selesai dan verifikasi lokal lulus.
set -euo pipefail

MACHINE="m_agralfkf6q2p3lxe7z6jrfosv4"
LOCAL="/data/workspace/SC-Alisamikloivnakujou"
REMOTE="/data/home/SC-Alisamikloivnakujou"
export INSTABOX_API_KEY="$(cat /data/home/.instabox_key)"

FILES=(
  "alya.js"
  "Alya.js"
  "plugins/cmd/upswgc.js"
  "plugins/cmd_registry.json"
  "lib/vx/commands.json"
  "plugins/cmd/menu.js"
  "plugins/cmd/allmenu.js"
  "plugins/cmd/vx_vxmenu.js"
  "lib/vx/menu-data.js"
  "lib/vx/dispatch.js"
)

echo "== Backup runtime =="
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
instabox exec "$MACHINE" -- bash -lc "cd '$REMOTE' && mkdir -p /data/home/sc-menu-fix-backup-$STAMP && for f in ${FILES[*]}; do if [ -f \"\$f\" ]; then mkdir -p \"/data/home/sc-menu-fix-backup-$STAMP/\$(dirname \"\$f\")\"; cp -a \"\$f\" \"/data/home/sc-menu-fix-backup-$STAMP/\$f\"; fi; done && echo BACKUP_OK"

echo "== Push file =="
for f in "${FILES[@]}"; do
  if [ ! -f "$LOCAL/$f" ]; then echo "MISSING LOCAL: $f"; exit 1; fi
  instabox cp "$LOCAL/$f" "$MACHINE:$REMOTE/$f" >/dev/null
  echo "  ok $f"
done

echo "== Restart service =="
instabox exec "$MACHINE" -- bash -lc "sudo systemctl restart alya-bot && sleep 15 && systemctl is-active alya-bot"

echo "== Hash check =="
for f in "${FILES[@]}"; do
  LH="$(sha256sum "$LOCAL/$f" | awk '{print $1}')"
  RH="$(instabox exec "$MACHINE" -- bash -lc "sha256sum '$REMOTE/$f'" | awk '{print $1}')"
  if [ "$LH" = "$RH" ]; then echo "  MATCH $f"; else echo "  MISMATCH $f ($LH != $RH)"; exit 1; fi
done

echo "DEPLOY_OK"
