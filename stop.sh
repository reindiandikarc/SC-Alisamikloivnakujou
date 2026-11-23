#!/bin/bash
# stop.sh — Hentikan bot Alya dengan aman (tanpa korupsi sesi)
# 
# ⚠️  JANGAN pakai Ctrl+C berkali-kali atau kill -9!
#     Gunakan script ini supaya sesi tidak corrupt.
#
# Cara pakai:
#   chmod +x stop.sh
#   ./stop.sh

echo "🛑 Menghentikan Alya Bot dengan aman..."

# Kalau pakai PM2
if command -v pm2 &>/dev/null && pm2 list | grep -q "alya-v19"; then
    pm2 stop alya-v19
    echo "✅ Bot dihentikan via PM2."
    exit 0
fi

# Kalau jalan langsung (node index.js)
PID=$(pgrep -f "node index.js" | head -1)
if [ -z "$PID" ]; then
    PID=$(pgrep -f "node.*index" | head -1)
fi

if [ -z "$PID" ]; then
    echo "⚠️  Bot tidak ditemukan. Mungkin sudah berhenti."
    exit 0
fi

echo "📍 Ditemukan PID: $PID — mengirim SIGINT (graceful)..."
kill -SIGINT $PID

# Tunggu maksimal 15 detik untuk shutdown bersih
for i in $(seq 1 15); do
    sleep 1
    if ! kill -0 $PID 2>/dev/null; then
        echo "✅ Bot berhasil dihentikan dengan bersih."
        exit 0
    fi
    echo "   Menunggu... ($i/15)"
done

# Kalau masih hidup setelah 15 detik, baru SIGTERM
echo "⚠️  Masih hidup setelah 15 detik, coba SIGTERM..."
kill -SIGTERM $PID
sleep 3

if kill -0 $PID 2>/dev/null; then
    echo "❌ Bot tidak mau berhenti. Terpaksa SIGKILL (sesi MUNGKIN corrupt)."
    kill -9 $PID
else
    echo "✅ Bot berhenti via SIGTERM."
fi
