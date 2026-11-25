#!/usr/bin/env bash
# Deploy generik: baca daftar file (1 path per baris) dari $MANIFEST.
# Backup -> push -> restart -> cek hash -> cek uimode runtime (tetap rich).
set -euo pipefail

MACHINE="${MACHINE:-m_agra4uecrjtas6lfatvepbdhvm}"
LOCAL="${LOCAL:-/data/workspace/SC-Alisamikloivnakujou}"
REMOTE="${REMOTE:-/data/home/SC-Alisamikloivnakujou}"
MANIFEST="${MANIFEST:-/data/tmp/opencode/deploy-files.txt}"
export INSTABOX_API_KEY="$(cat /data/home/.instabox_key)"

mapfile -t FILES < <(grep -vE '^\s*(#|$)' "$MANIFEST" || true)
if [ "${#FILES[@]}" -eq 0 ]; then echo "MANIFEST KOSONG: $MANIFEST"; exit 1; fi

echo "== Backup runtime =="
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP="/data/home/sc-verified-backup-$STAMP"
instabox exec "$MACHINE" -- bash -lc "mkdir -p '$BACKUP' && cd '$REMOTE' && for f in ${FILES[*]}; do if [ -f \"\$f\" ]; then mkdir -p \"$BACKUP/\${f%/*}\"; cp -a \"\$f\" \"$BACKUP/\$f\"; fi; done && echo BACKUP_OK=$BACKUP"

echo "== Push file =="
for f in "${FILES[@]}"; do
  [ -f "$LOCAL/$f" ] || { echo "MISSING LOCAL: $f"; exit 1; }
  instabox cp "$LOCAL/$f" "$MACHINE:$REMOTE/$f" >/dev/null
  echo "  ok $f"
done

echo "== Patch Baileys sound sticker =="
instabox exec "$MACHINE" -- bash -lc "cd '$REMOTE' && python3 scripts/patch-baileys-sticker-audio.py"

echo "== Restart service =="
instabox exec "$MACHINE" -- bash -lc "sudo systemctl restart alya-bot && sleep 18 && systemctl is-active alya-bot"

echo "== Hash check =="
for f in "${FILES[@]}"; do
  LH="$(sha256sum "$LOCAL/$f" | awk '{print $1}')"
  RH="$(instabox exec "$MACHINE" -- bash -lc "sha256sum '$REMOTE/$f'" | awk '{print $1}')"
  if [ "$LH" = "$RH" ]; then echo "  MATCH $f"; else echo "  MISMATCH $f ($LH != $RH)"; exit 1; fi
done

echo "== Runtime sanity =="
instabox exec "$MACHINE" -- bash -lc "cd '$REMOTE' && printf 'service=' && systemctl is-active alya-bot && printf 'uimode=' && tr -d '\n' < database/uimode.json && printf '\nearly_rvo_markers=' && grep -c 'ALYA_V13_EARLY_RVO_PATCH' node_modules/@whiskeysockets/baileys/src/Socket/messages-recv.js && printf 'sound_patch=' && grep -c 'ALYA_SOUND_STICKER_V2_PATCH' node_modules/@whiskeysockets/baileys/src/index.bundle.cjs && printf 'field134=' && grep -c 'w.uint32(1074)' node_modules/@whiskeysockets/baileys/src/index.bundle.cjs && printf 'recent_errors=' && (journalctl -u alya-bot --since '5 min ago' --no-pager 2>/dev/null | grep -ciE 'error|uncaught|crash' || true)"

echo "DEPLOY_OK"
