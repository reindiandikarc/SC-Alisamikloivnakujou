#!/bin/bash
# ============================================
#   SCRIPT BACKUP DATABASE ALYA BOT
#   Jalankan sebelum update bot
# ============================================

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="./backup_database/$TIMESTAMP"
DB_DIR="./database"

echo "🔄 Memulai backup database... ($TIMESTAMP)"
mkdir -p "$BACKUP_DIR"

# Backup semua file .json di folder database
cp -r "$DB_DIR"/*.json "$BACKUP_DIR/" 2>/dev/null

# Backup database.json utama (di root)
cp ./database.json "$BACKUP_DIR/ROOT_database.json" 2>/dev/null

# Hitung total file
TOTAL=$(ls "$BACKUP_DIR" | wc -l)
echo "✅ Backup selesai! $TOTAL file tersimpan di: $BACKUP_DIR"
echo ""
echo "📋 File yang di-backup:"
ls "$BACKUP_DIR"
