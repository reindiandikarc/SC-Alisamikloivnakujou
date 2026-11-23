#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# install_tools.sh — Install FFmpeg & yt-dlp untuk Alya V13
# Usage: bash install_tools.sh
# Cocok untuk: Ubuntu/Debian VPS, Termux Android
# ═══════════════════════════════════════════════════════════════

set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

log()  { echo -e "${CYAN}[INFO]${NC} $1"; }
ok()   { echo -e "${GREEN}[OK]${NC}   $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERR]${NC}  $1"; }

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   Alya V13 — FFmpeg & yt-dlp Installer  ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
echo ""

# ─── Deteksi environment ─────────────────────────────────────
IS_TERMUX=false
IS_LINUX=false

if [ -n "$TERMUX_VERSION" ] || [ -d "/data/data/com.termux" ]; then
  IS_TERMUX=true
  log "Environment: Termux (Android)"
elif [ "$(uname -s)" = "Linux" ]; then
  IS_LINUX=true
  log "Environment: Linux (VPS/Server)"
else
  err "Environment tidak dikenal. Script ini hanya untuk Linux/Termux."
  exit 1
fi

# ═══════════════════════════════════════════════════════════════
# INSTALL FFMPEG
# ═══════════════════════════════════════════════════════════════
log "Memeriksa FFmpeg..."

if command -v ffmpeg &>/dev/null; then
  FFMPEG_VER=$(ffmpeg -version 2>&1 | head -1 | awk '{print $3}')
  ok "FFmpeg sudah terinstall: $FFMPEG_VER"
else
  warn "FFmpeg belum ada. Menginstall..."

  if $IS_TERMUX; then
    pkg install -y ffmpeg
  else
    # Ubuntu/Debian
    if command -v apt-get &>/dev/null; then
      apt-get update -qq
      apt-get install -y ffmpeg
    elif command -v yum &>/dev/null; then
      # CentOS/RHEL — butuh EPEL
      yum install -y epel-release
      yum install -y ffmpeg
    else
      err "Package manager tidak dikenal. Install FFmpeg manual."
      exit 1
    fi
  fi

  if command -v ffmpeg &>/dev/null; then
    FFMPEG_VER=$(ffmpeg -version 2>&1 | head -1 | awk '{print $3}')
    ok "FFmpeg berhasil diinstall: $FFMPEG_VER"
  else
    err "Instalasi FFmpeg gagal!"
    exit 1
  fi
fi

FFMPEG_PATH=$(which ffmpeg)
log "FFmpeg path: $FFMPEG_PATH"

# ═══════════════════════════════════════════════════════════════
# INSTALL yt-dlp
# ═══════════════════════════════════════════════════════════════
log "Memeriksa yt-dlp..."

YTDLP_BIN=""

# Cek lokasi umum
for loc in "/usr/local/bin/yt-dlp" "/usr/bin/yt-dlp" "$HOME/.local/bin/yt-dlp" "$PREFIX/bin/yt-dlp"; do
  if [ -x "$loc" ]; then
    YTDLP_BIN="$loc"
    break
  fi
done

if [ -n "$YTDLP_BIN" ]; then
  YTDLP_VER=$("$YTDLP_BIN" --version 2>/dev/null || echo "unknown")
  ok "yt-dlp sudah terinstall: $YTDLP_VER — $YTDLP_BIN"
  log "Update ke versi terbaru..."
  "$YTDLP_BIN" -U 2>/dev/null || pip3 install -U yt-dlp 2>/dev/null || warn "Gagal update yt-dlp (bukan masalah fatal)"
else
  warn "yt-dlp belum ada. Menginstall..."

  INSTALL_OK=false

  # Metode 1: pip3
  if command -v pip3 &>/dev/null; then
    log "Mencoba pip3 install yt-dlp..."
    if pip3 install -U yt-dlp; then
      INSTALL_OK=true
    fi
  fi

  # Metode 2: pip
  if ! $INSTALL_OK && command -v pip &>/dev/null; then
    log "Mencoba pip install yt-dlp..."
    if pip install -U yt-dlp; then
      INSTALL_OK=true
    fi
  fi

  # Metode 3: download binary langsung (Linux saja)
  if ! $INSTALL_OK && $IS_LINUX; then
    log "Mencoba download binary yt-dlp langsung..."
    DEST="/usr/local/bin/yt-dlp"
    if curl -fsSL "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp" -o "$DEST" 2>/dev/null; then
      chmod +x "$DEST"
      INSTALL_OK=true
    elif wget -q "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp" -O "$DEST" 2>/dev/null; then
      chmod +x "$DEST"
      INSTALL_OK=true
    fi
  fi

  # Metode 4: Termux pkg
  if ! $INSTALL_OK && $IS_TERMUX; then
    log "Mencoba pkg install yt-dlp (Termux)..."
    if pkg install -y yt-dlp; then
      INSTALL_OK=true
    fi
  fi

  if ! $INSTALL_OK; then
    err "Semua metode instalasi yt-dlp gagal!"
    err "Coba manual: pip3 install yt-dlp  ATAU  apt install yt-dlp"
    exit 1
  fi

  # Cari lagi setelah install
  for loc in "/usr/local/bin/yt-dlp" "/usr/bin/yt-dlp" "$HOME/.local/bin/yt-dlp" "$PREFIX/bin/yt-dlp"; do
    if [ -x "$loc" ]; then
      YTDLP_BIN="$loc"
      break
    fi
  done

  if [ -z "$YTDLP_BIN" ]; then
    YTDLP_BIN=$(which yt-dlp 2>/dev/null || echo "")
  fi

  if [ -n "$YTDLP_BIN" ]; then
    YTDLP_VER=$("$YTDLP_BIN" --version)
    ok "yt-dlp berhasil diinstall: $YTDLP_VER — $YTDLP_BIN"
  else
    err "yt-dlp terinstall tapi binary tidak ditemukan di PATH!"
    exit 1
  fi
fi

# ═══════════════════════════════════════════════════════════════
# VERIFIKASI & GENERATE CONFIG SNIPPET
# ═══════════════════════════════════════════════════════════════
echo ""
log "Verifikasi tools..."

FFMPEG_OK=false
YTDLP_OK=false

if command -v ffmpeg &>/dev/null && ffmpeg -version &>/dev/null 2>&1; then
  FFMPEG_OK=true
  ok "ffmpeg ✅ — $(which ffmpeg)"
else
  err "ffmpeg ❌"
fi

if [ -n "$YTDLP_BIN" ] && "$YTDLP_BIN" --version &>/dev/null 2>&1; then
  YTDLP_OK=true
  ok "yt-dlp ✅ — $YTDLP_BIN"
else
  err "yt-dlp ❌"
fi

echo ""

if $FFMPEG_OK && $YTDLP_OK; then
  echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║   ✅ SEMUA TOOLS BERHASIL TERINSTALL!   ║${NC}"
  echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${CYAN}📋 Tambahkan baris ini ke settings.js atau alya.js (opsional):${NC}"
  echo ""
  echo "  global.FFMPEG_PATH = '$(which ffmpeg)';"
  echo "  global.YTDLP_PATH  = '$YTDLP_BIN';"
  echo ""
  echo -e "${YELLOW}Atau biarkan otomatis — plugin akan auto-detect sendiri.${NC}"
  echo ""
  echo -e "${CYAN}Commands yang akan berfungsi setelah ini:${NC}"
  echo "  .play   — search + pilih format (audio/video)"
  echo "  .ytmp3  — download audio MP3 langsung"
  echo "  .ytmp4  — download video YouTube (pilih kualitas)"
  echo "  .tomp3  — convert video/audio → MP3 (FFmpeg)"
  echo "  .tomp4  — convert stiker animasi/video → MP4 (FFmpeg)"
else
  echo -e "${RED}╔══════════════════════════════════════════╗${NC}"
  echo -e "${RED}║   ❌ ADA TOOLS YANG GAGAL TERINSTALL    ║${NC}"
  echo -e "${RED}╚══════════════════════════════════════════╝${NC}"
  echo ""
  $FFMPEG_OK || echo "  FFmpeg: GAGAL — coba: sudo apt install ffmpeg"
  $YTDLP_OK  || echo "  yt-dlp: GAGAL — coba: pip3 install yt-dlp"
  exit 1
fi
