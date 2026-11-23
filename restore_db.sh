#!/bin/bash
# ============================================
#   SCRIPT RESTORE DATABASE ALYA BOT
# ============================================

BACKUP_PARENT="./backup_database"

if [ -z "$1" ]; then
    echo "📋 Daftar backup yang tersedia:"
    ls -1t "$BACKUP_PARENT" 2>/dev/null || echo "Tidak ada backup ditemukan."
    echo ""
    echo "Penggunaan: ./restore_db.sh [nama_folder_backup]"
    echo "Contoh:     ./restore_db.sh 2026-05-29_10-00-00"
    exit 1
fi

BACKUP_DIR="$BACKUP_PARENT/$1"

if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Folder backup '$BACKUP_DIR' tidak ditemukan!"
    exit 1
fi

echo "🔄 Merestore database dari: $BACKUP_DIR"

# Restore semua .json ke folder database
cp "$BACKUP_DIR"/*.json ./database/ 2>/dev/null

# Restore database.json utama jika ada
if [ -f "$BACKUP_DIR/ROOT_database.json" ]; then
    cp "$BACKUP_DIR/ROOT_database.json" ./database.json
fi

echo "✅ Restore selesai!"
