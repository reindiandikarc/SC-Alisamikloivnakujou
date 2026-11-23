/**
 * ALYA V13 — Reply Greeting Thumbnail
 * Foto kecil ucapan waktu di atas setiap balasan teks bot.
 * Media (gambar/audio/video/sticker) tidak kena greeting.
 */
'use strict'

const fs     = require('fs')
const path   = require('path')
const moment = require('moment-timezone')

const MEDIA_DIR = path.join(__dirname, '..', 'media', 'greeting')

const SESI_CONFIG = {
  pagi:  { file: 'pagi.jpg',  ucapan: '🌄 Selamat Pagi' },
  siang: { file: 'siang.jpg', ucapan: '☀️ Selamat Siang' },
  sore:  { file: 'sore.jpg',  ucapan: '🌅 Selamat Sore' },
  malam: { file: 'malam.jpg', ucapan: '🌙 Selamat Malam' },
}

function getWaktuSesi() {
  const jam = parseInt(moment().tz('Asia/Jakarta').format('HH'), 10)
  if (jam >= 4  && jam < 11) return 'pagi'
  if (jam >= 11 && jam < 15) return 'siang'
  if (jam >= 15 && jam < 18) return 'sore'
  return 'malam'
}

function readMediaBuffer(filename) {
  try {
    const p = path.join(MEDIA_DIR, filename)
    if (fs.existsSync(p)) return fs.readFileSync(p)
    const fallback = path.join(MEDIA_DIR, 'default.jpg')
    if (fs.existsSync(fallback)) return fs.readFileSync(fallback)
  } catch {}
  return null
}

/**
 * Bangun payload greeting untuk teks.
 * Selalu kembalikan object siap kirim ke alya.sendMessage().
 */
function buildGreetingMessage(teks) {
  const sesi    = getWaktuSesi()
  const cfg     = SESI_CONFIG[sesi]
  const buffer  = readMediaBuffer(cfg.file)
  const botName = global?.botname || 'Alya Bot'
  const label   = `${cfg.ucapan}  —  ${botName}`

  if (buffer) {
    return {
      document:      fs.readFileSync(path.join(process.cwd(), 'package.json')),
      fileName:      label,
      fileLength:    99999,
      // jpegThumbnail wajib buffer JPEG asli — mimetype image/png di sini
      // sebelumnya membuat thumbnail gagal dirender oleh WhatsApp.
      mimetype:      'image/jpeg',
      jpegThumbnail: buffer,
      caption:       '\n' + teks,
    }
  }
  return { text: teks }
}

/**
 * Cek apakah payload/teks adalah MEDIA (bukan teks murni).
 * Kalau iya → tidak perlu greeting, kirim as-is.
 */
function isMediaPayload(teks) {
  if (typeof teks !== 'object' || teks === null) return false
  return !!(
    teks.image   ||
    teks.video   ||
    teks.audio   ||
    teks.sticker ||
    teks.document||
    teks.ptv
  )
}

module.exports = { buildGreetingMessage, isMediaPayload, getWaktuSesi }
