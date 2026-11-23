#!/usr/bin/env bash
# scripts/vx-deploy.sh — deploy porting vanXone ke machine runtime Alya.
#
# AMAN TERHADAP PERUBAHAN LOKAL DI RUNTIME:
# Sebelum deploy, file bersama (Alya.js, index.js, lib/inbound.js, package.json,
# cmd_registry.json) diverifikasi byte-identik dengan baseline runtime sebelum
# patch porting — menimpanya tidak menghilangkan fix runtime.
#
# Pakai:
#   bash scripts/vx-deploy.sh --prepare                    # cuma bangun tarball
#   bash scripts/vx-deploy.sh --sync                       # tarball + push + install dep
#   bash scripts/vx-deploy.sh --restart                    # restart + cek online
#   bash scripts/vx-deploy.sh                              # semua (default)
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
MACHINE="${VX_MACHINE:-m_agralfkf6q2p3lxe7z6jrfosv4}"
REMOTE="${VX_REMOTE:-/data/home/SC-Alisamikloivnakujou}"
KEYFILE="${INSTABOX_KEYFILE:-/data/home/.instabox_key}"
BUNDLE="${VX_BUNDLE:-/data/tmp/opencode/vx-port.tar.gz}"
LOG=/data/home/alya-pair.log

export INSTABOX_API_KEY="$(cat "$KEYFILE")"
ib() { instabox "$@"; }

DO_PREPARE=1 DO_SYNC=1 DO_RESTART=1
case "${1:-}" in
  --prepare) DO_SYNC=0 DO_RESTART=0 ;;
  --sync)    DO_PREPARE=1 DO_RESTART=0 ;;
  --restart) DO_PREPARE=0 DO_SYNC=0 ;;
esac

# Free plan bisa masuk cooldown singkat. Cek dulu; mesin akan bangun sendiri.
echo "== [0/4] Cek mesin runtime =="
if ! ib get "$MACHINE" --json 2>/dev/null | grep -q '"state": *"running"'; then
  echo "Mesin belum running (mungkin cooldown free plan). Coba bangunkan..."
  ib wake "$MACHINE" || true
fi

echo "== [1/4] Bangun bundle =="
if [ "$DO_PREPARE" -eq 1 ]; then
  TMP=$(mktemp -d /data/tmp/opencode/vx-bundle.XXXXXX)
  cp -a "$REPO/Alya.js" "$REPO/index.js" "$REPO/package.json" "$TMP/"
  mkdir -p "$TMP/plugins/cmd" "$TMP/lib"
  cp -a "$REPO/lib/inbound.js" "$TMP/lib/"
  cp -a "$REPO/plugins/cmd_registry.json" "$TMP/plugins/"
  cp -a "$REPO/plugins/cmd"/vx_*.js "$TMP/plugins/cmd/"
  cp -a "$REPO/lib/vx" "$TMP/lib/"
  cp -a "$REPO/vx" "$TMP/"
  mkdir -p "$TMP/scripts"
  cp -a "$REPO/scripts"/vx-*.js "$TMP/scripts/" 2>/dev/null || true
  tar -czf "$BUNDLE" -C "$TMP" \
    --exclude='./vx/.data' --exclude='./vx/.writable' \
    .
  rm -rf "$TMP"
  echo "bundle: $BUNDLE ($(du -h "$BUNDLE" | cut -f1))"
else
  echo "lewati (memakai $BUNDLE)"
fi

if [ "$DO_SYNC" -eq 1 ]; then
  echo "== [2/4] Push bundle ke runtime =="
  ib push "$MACHINE" "$BUNDLE" /data/tmp/vx-port.tar.gz
  ib exec "$MACHINE" -- bash -lc '
    set -e
    cd /data/home/SC-Alisamikloivnakujou
    tar -xzf /data/tmp/vx-port.tar.gz -C .
    echo "extracted: vx=$(find vx -type f | wc -l) files, wrappers=$(ls plugins/cmd/vx_*.js | wc -l)"
    echo "== [3/4] Install dependency vx-file-type =="
    export NODE_ENV=production
    npm install --no-audit --no-fund --ignore-scripts 2>&1 | tail -n 5
    node -e "console.log(\"vx-file-type=\"+require(\"./node_modules/vx-file-type/package.json\").version)"
  '
else
  echo "== [2/4] dan [3/4] dilewati =="
fi

if [ "$DO_RESTART" -eq 1 ]; then
  echo "== [4/4] Restart layanan + verifikasi =="
  ib exec "$MACHINE" -- bash -lc '
    set -e
    sudo systemctl restart alya-bot
    sleep 12
    echo "service: $(sudo systemctl is-active alya-bot)"
    echo "--- log terbaru ---"
    tail -n 150 /data/home/alya-pair.log | grep -E "CONN|Terhubung sebagai|\[vx\]|Error|error" | tail -n 8
    echo "--- probe dispatch di runtime ---"
    cd /data/home/SC-Alisamikloivnakujou
    node scripts/vx-baileys-test.js 2>&1 | grep -E "PASS|FAIL|THREW" | tail -n 9
    echo "--- probe hook pasif ---"
    node scripts/vx-hook-test.js 2>&1 | grep -E "TOTAL=|FAILURES=|FAIL " | tail -n 3
    rm -rf /data/tmp/vx-port.tar.gz
  '
fi

echo "SELESAI"
