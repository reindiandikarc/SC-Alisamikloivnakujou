/**
 * ALYA V20 — Reply Card ala Ourin
 * Gaya: "WhatsApp Status" header + Document Card thumbnail
 *
 * FIX v20.2:
 *   - Modul metaai.js sudah dihapus dari proyek (tidak dipakai lagi).
 *   - Logika baca media/cards/ (custom card & metaai.jpg) DIHAPUS total.
 *   - Thumbnail SEKARANG selalu langsung ke foto greeting (media/greeting/)
 *     sesuai jam WIB saat ini, dibaca fresh per-call (tidak di-cache),
 *     sehingga otomatis berganti tanpa perlu restart bot.
 *
 * Sesi gambar greeting (media/greeting/):
 *   04:00 – 10:59  → pagi.jpg
 *   11:00 – 14:59  → siang.jpg
 *   15:00 – 17:59  → sore.jpg
 *   18:00 – 03:59  → malam.jpg
 */

'use strict'

const fs     = require('fs')
const path   = require('path')
const moment = require('moment-timezone')

// ─── Font style (lazy-require agar tidak circular) ────────────────────────
let _fontStyle = null
function _getFont() {
  if (!_fontStyle) {
    try { _fontStyle = require('../lib/fontStyle') } catch {}
  }
  return _fontStyle
}

// ─── Path ─────────────────────────────────────────────────────────────────
// CATATAN: media/cards/ TIDAK lagi dipakai/dibaca oleh modul ini.
const GREETING_DIR = path.join(__dirname, '..', 'media', 'greeting')
const PKG_PATH      = path.join(process.cwd(), 'package.json')

// ─── Helper baca file (tidak throw) ──────────────────────────────────────
function _tryRead(filePath) {
  try {
    if (fs.existsSync(filePath)) return fs.readFileSync(filePath)
  } catch {}
  return null
}

// ─── Tentukan sesi waktu WIB ──────────────────────────────────────────────
function getWaktuSesi() {
  const jam = parseInt(moment().tz('Asia/Jakarta').format('HH'), 10)
  if (jam >= 4  && jam < 11) return 'pagi'
  if (jam >= 11 && jam < 15) return 'siang'
  if (jam >= 15 && jam < 18) return 'sore'
  return 'malam'
}

// ─── Ambil buffer thumbnail — LANGSUNG ke greeting sesuai jam WIB ─────────
/**
 * Urutan prioritas (disederhanakan, sudah TIDAK baca media/cards/ sama sekali):
 *   1. Buffer langsung (directBuf), jika eksplisit diberikan oleh pemanggil
 *   2. Foto greeting sesuai jam WIB SEKARANG (pagi/siang/sore/malam) — real-time
 *   3. media/greeting/default.jpg, lalu media/alya.jpg sebagai fallback terakhir
 *
 * Parameter pertama (dulu "customName"/"thumbName" untuk file custom di
 * media/cards/) tetap diterima demi kompatibilitas pemanggil lama, tapi
 * nilainya tidak lagi dipakai untuk membaca file apapun.
 */
function _resolveThumb(_legacyCardName, directBuf) {
  // 1. Buffer langsung (override eksplisit)
  if (directBuf) return directBuf

  // 2. Greeting sesuai jam WIB — dibaca FRESH setiap kali dipanggil
  const sesi      = getWaktuSesi()
  const sesiFiles = {
    pagi:  'pagi.jpg',
    siang: 'siang.jpg',
    sore:  'sore.jpg',
    malam: 'malam.jpg',
  }
  const buf = _tryRead(path.join(GREETING_DIR, sesiFiles[sesi]))
  if (buf) return buf

  // 3. Fallback terakhir
  return (
    _tryRead(path.join(GREETING_DIR, 'default.jpg')) ||
    _tryRead(path.join(process.cwd(), 'media', 'alya.jpg')) ||
    null
  )
}

// ─── resolveCardThumb — alias publik untuk _resolveThumb ──────────────────
// Dipakai oleh alya.js sebagai resolver thumbnail CARD BODY.
function resolveCardThumb(thumbName, directBuf) {
  return _resolveThumb(thumbName, directBuf)
}

// ─── getThumbBuffer — kompatibilitas pemanggil lama ───────────────────────
// customName tidak lagi memengaruhi hasil; selalu balik ke greeting waktu.
function getThumbBuffer(customName) {
  return _resolveThumb(customName, null)
}

// ─── reloadMetaThumb — stub agar kode lain yang memanggilnya tidak error ──
function reloadMetaThumb() {
  // Tidak perlu reload — thumbnail selalu real-time dari media/greeting/
}

// ─── Ourin-style sender context (pengganti metaai.js yang sudah dihapus) ──
/**
 * Membangun contextInfo bergaya "forwarded newsletter" yang membuat
 * WhatsApp menampilkan nama channel + tombol "Lihat saluran" di header
 * bubble pesan (efek yang sebelumnya dihasilkan oleh metaai.js).
 *
 * FIX: sebelumnya newsletterJid di-hardcode ke ID placeholder yang tidak
 * terhubung ke channel resmi bot, sehingga WhatsApp gagal me-resolve
 * metadata channel-nya dan badge/tombol "Lihat saluran" tidak muncul
 * sama sekali. Sekarang diambil dari global.channel & global.channeln
 * (settings.js) — sama seperti pola yang dipakai di tempat lain pada
 * alya.js — supaya valid dan konsisten dengan channel resmi yang
 * sebenarnya dikonfigurasi.
 *
 * @param {string} [botLabel]
 * @returns {Object} contextInfo
 */
function buildOurinSenderCtx(botLabel) {
  const name = botLabel || global.botname || 'Alya Assistant'
  return {
    isForwarded: true,
    forwardingScore: 9999,
    forwardedNewsletterMessageInfo: {
      newsletterJid:    global.channel,
      newsletterName:   global.channeln || name,
      serverMessageId:  Math.floor(Math.random() * 100) + 1,
    },
  }
}

// ─── Fake quoted "WhatsApp Status" ────────────────────────────────────────
/**
 * Membuat header quoted bergaya Ourin:
 *   WhatsApp ✔ • Status
 *   👤 Kontak: <displayName>
 *
 * @param {string} [displayName]
 * @returns {Object}  quoted object untuk sendMessage
 */
function buildFakeStatusQuoted(displayName) {
  const name = displayName || global.botname || 'Alya Assistant'
  return {
    key: {
      fromMe:      false,
      participant: '0@s.whatsapp.net',
      remoteJid:   'status@broadcast',
    },
    message: {
      contactMessage: {
        displayName,
        vcard:
          `BEGIN:VCARD\nVERSION:3.0\nN:XL;${name},;;;\nFN:${name}\n` +
          `item1.TEL;waid=13135550002:+1 (313) 555-0002\n` +
          `item1.X-ABLabel:Ponsel\nEND:VCARD`,
        sendEphemeral: true,
      },
    },
  }
}

// ─── Build payload document card ──────────────────────────────────────────
/**
 * Membangun payload siap kirim untuk document-card reply.
 * Thumbnail dipilih DINAMIS sesuai jam WIB saat fungsi ini dipanggil,
 * langsung dari media/greeting/ (tidak lagi melalui media/cards/).
 *
 * @param {string}  text
 * @param {Object}  [opts]
 * @param {string}  [opts.fileName]    Judul card  (default: botname)
 * @param {string}  [opts.thumbName]   Tidak terpakai lagi — disimpan demi kompatibilitas
 * @param {Buffer}  [opts.thumbnail]   Override thumbnail langsung (Buffer)
 * @param {Array}   [opts.mentions]    Array JID mentions
 * @param {string}  [opts.statusName]  Nama di header quoted
 * @param {number}  [opts.fileLength]  Angka ukuran tampilan (default: 100 TB)
 * @returns {{ payload: Object, quoted: Object|undefined }}
 */
function buildGreetingCard(text, opts = {}) {
  const {
    fileName   = global.botname || 'Alya Assistant',
    thumbName  = null,
    thumbnail  = null,
    mentions   = [],
    statusName,
    fileLength = 99999999999999,
  } = opts

  let displayText = (typeof text === 'string') ? text : String(text || '')
  try {
    const fontLib = _getFont()
    if (fontLib) displayText = fontLib.autoApplyFont(displayText)
  } catch {}

  // Thumbnail diambil fresh setiap call — langsung dari greeting waktu WIB
  const thumbBuf = thumbnail || _resolveThumb(thumbName, null)

  // Fallback teks biasa jika tidak ada thumb sama sekali
  if (!thumbBuf) {
    return { payload: { text: displayText, mentions }, quoted: undefined }
  }

  let pkgBuf
  try   { pkgBuf = fs.readFileSync(PKG_PATH) }
  catch { pkgBuf = Buffer.from('{}') }

  return {
    payload: {
      document:      pkgBuf,
      mimetype:      'image/jpeg',
      fileName,
      fileLength,
      jpegThumbnail: thumbBuf,
      caption:       displayText,
      mentions,
    },
    quoted: buildFakeStatusQuoted(statusName || fileName),
  }
}

// ─── Export ────────────────────────────────────────────────────────────────
module.exports = {
  buildGreetingCard,
  buildFakeStatusQuoted,
  buildOurinSenderCtx,
  getThumbBuffer,
  getWaktuSesi,
  reloadMetaThumb,   // compat stub — no-op
  resolveCardThumb,
}
