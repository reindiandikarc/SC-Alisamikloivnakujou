#!/bin/bash
# backup_session.sh — Backup folder sesi Alyachan secara berkala
#
# Cara setup (cron job setiap jam):
#   crontab -e
#   0 * * * * /path/to/alya_output/backup_session.sh
#
# Cara restore kalau sesi corrupt:
#   ./backup_session.sh restore

SESSION_DIR="./Alyachan"
BACKUP_DIR="./session_backup"
MAX_BACKUPS=5

backup() {
    if [ ! -d "$SESSION_DIR" ]; then
        echo "⚠️  Folder sesi '$SESSION_DIR' tidak ditemukan."
        exit 1
    fi

    mkdir -p "$BACKUP_DIR"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/session_$TIMESTAMP.tar.gz"

    tar -czf "$BACKUP_FILE" "$SESSION_DIR" 2>/dev/null
    echo "✅ Backup disimpan: $BACKUP_FILE"

    # Hapus backup lama, sisakan MAX_BACKUPS terbaru
    ls -t "$BACKUP_DIR"/session_*.tar.gz 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm
    echo "📁 Total backup saat ini: $(ls "$BACKUP_DIR"/session_*.tar.gz 2>/dev/null | wc -l)"
}

restore() {
    LATEST=$(ls -t "$BACKUP_DIR"/session_*.tar.gz 2>/dev/null | head -1)
    if [ -z "$LATEST" ]; then
        echo "❌ Tidak ada backup ditemukan di $BACKUP_DIR"
        exit 1
    fi

    echo "📦 Restore dari: $LATEST"
    # Backup sesi yang corrupt dulu (kalau ada)
    if [ -d "$SESSION_DIR" ]; then
        mv "$SESSION_DIR" "${SESSION_DIR}_corrupt_$(date +%H%M%S)"
    fi
    tar -xzf "$LATEST" .
    echo "✅ Sesi berhasil di-restore. Jalankan bot lagi."
}

case "$1" in
    restore) restore ;;
    *)       backup  ;;
esac
