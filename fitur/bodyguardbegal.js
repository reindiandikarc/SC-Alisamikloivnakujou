// Plugin: bodyguardbegal
// Plugin baru — sistem perlindungan dari .begal money
// Database: ./database/begal.json
// Format begal.json: { "bodyguard": { "628xxx@s.whatsapp.net": { stok: N, addedAt: timestamp } } }
// Commands: bodyguardbegal, bgbegal, cekbodyguard

const fs   = require('fs')
const path = require('path')

// ── Helper: baca/tulis database begal.json ────────────────────────────
const BEGAL_DB_PATH = './database/begal.json'

function readBegalDB() {
  try {
    if (!fs.existsSync(BEGAL_DB_PATH)) {
      fs.writeFileSync(BEGAL_DB_PATH, JSON.stringify({ bodyguard: {} }, null, 2))
    }
    const raw = JSON.parse(fs.readFileSync(BEGAL_DB_PATH, 'utf8'))
    if (!raw.bodyguard) raw.bodyguard = {}
    return raw
  } catch {
    return { bodyguard: {} }
  }
}

function writeBegalDB(data) {
  try {
    fs.writeFileSync(BEGAL_DB_PATH, JSON.stringify(data, null, 2))
    return true
  } catch {
    return false
  }
}

// ── Konstanta ──────────────────────────────────────────────────────────
const BODYGUARD_PRICE    = 500_000_000   // Harga beli per 1 stok (money)
const BODYGUARD_MAX_STOK = 5             // Maks stok yang bisa dimiliki
const BODYGUARD_FREE_JID = []            // Nomor yang bebas (owner, dll — isi manual jika perlu)

module.exports = [

  // ── .bodyguardbegal / .bgbegal — beli bodyguard ──────────────────────
  {
    command: ['bodyguardbegal', 'bgbegal'],
    tags: ['general'],
    run: async (alya, m, ctx) => {
      const {
        prefix, command,
        sender, pushname,
        Ryuu, isPrem,
        replyalya, replytolak, reply
      } = ctx

      if (!m.isGroup) return replytolak('❌ Fitur ini hanya bisa digunakan di grup!')

      let userDB  = global.db?.users?.[sender]
      if (!userDB) return replyalya('❌ Data kamu tidak ditemukan. Ketik sembarang dulu agar terdaftar!')

      userDB.money   ??= 0
      userDB.antibegal ??= 0

      // ── Baca database begal.json ──────────────────────────────────
      const begalDB = readBegalDB()
      const bgData  = begalDB.bodyguard[sender] || { stok: 0, addedAt: 0 }

      // Sinkronisasi: ambil stok terbesar antara antibegal (lama) dan begal.json (baru)
      let stokSekarang = Math.max(userDB.antibegal || 0, bgData.stok || 0)

      if (stokSekarang >= BODYGUARD_MAX_STOK) {
        return replyalya(
          `🛡️ *STOK PENUH!*\n\n` +
          `Bodyguard kamu sudah penuh! Maksimal *${BODYGUARD_MAX_STOK} stok*.\n` +
          `Pakai dulu sebelum beli lagi.\n\n` +
          `🛡️ Stok saat ini: *${stokSekarang}*`
        )
      }

      if (userDB.money < BODYGUARD_PRICE) {
        return replyalya(
          `❌ *UANG TIDAK CUKUP!*\n\n` +
          `💰 Harga Bodyguard : *Rp ${BODYGUARD_PRICE.toLocaleString('id-ID')}*\n` +
          `💸 Uang kamu       : *Rp ${userDB.money.toLocaleString('id-ID')}*\n\n` +
          `_Kurang: Rp ${(BODYGUARD_PRICE - userDB.money).toLocaleString('id-ID')}_`
        )
      }

      // ── Transaksi ──────────────────────────────────────────────────
      userDB.money    -= BODYGUARD_PRICE
      stokSekarang    += 1
      userDB.antibegal = stokSekarang   // sync ke db.users juga

      // Tulis ke begal.json
      begalDB.bodyguard[sender] = {
        stok    : stokSekarang,
        addedAt : Date.now()
      }
      writeBegalDB(begalDB)

      await alya.sendMessage(m.chat, { react: { text: '🛡️', key: m.key } })

      replyalya(
        `✅ *BODYGUARD BERHASIL DIBELI!*\n` +
        `━━━━━━━━━━━━━━━\n` +
        `👤 User        : @${sender.split('@')[0]}\n` +
        `🛡️ Stok BG     : *${stokSekarang} / ${BODYGUARD_MAX_STOK}*\n` +
        `💸 Harga       : *Rp ${BODYGUARD_PRICE.toLocaleString('id-ID')}*\n` +
        `💰 Sisa uang   : *Rp ${userDB.money.toLocaleString('id-ID')}*\n` +
        `━━━━━━━━━━━━━━━\n` +
        `_🛡️ Bodyguard aktif! Saat dibegal, 1 stok akan terpakai & pelaku digebukin balik._`
      )
    }
  },

  // ── .cekbodyguard — cek stok bodyguard diri sendiri / target ─────────
  {
    command: ['cekbodyguard', 'cekbg'],
    tags: ['general'],
    run: async (alya, m, ctx) => {
      const {
        args, sender,
        replyalya, replytolak
      } = ctx

      // Target: reply / mention / diri sendiri
      let targetId = m.quoted?.sender
        || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null)
        || sender

      const begalDB    = readBegalDB()
      const bgData     = begalDB.bodyguard[targetId] || { stok: 0 }
      const userDB     = global.db?.users?.[targetId] || {}
      const stok       = Math.max(bgData.stok || 0, userDB.antibegal || 0)
      const targetNo   = targetId.split('@')[0]

      replyalya(
        `🛡️ *CEK BODYGUARD*\n` +
        `━━━━━━━━━━━━━━━\n` +
        `👤 Nomor  : @${targetNo}\n` +
        `🛡️ Stok   : *${stok} / ${BODYGUARD_MAX_STOK}*\n` +
        `📊 Status : ${stok > 0 ? '*AKTIF — Terlindungi!*' : '*TIDAK ADA — Rentan dibegal!*'}\n` +
        `━━━━━━━━━━━━━━━\n` +
        `_Ketik .bodyguardbegal untuk beli perlindungan._`
      )
    }
  },

  // ── .resetbg — owner reset stok bodyguard user (untuk debug/admin) ────
  {
    command: ['resetbg'],
    tags: ['owner'],
    run: async (alya, m, ctx) => {
      const {
        args, sender, prefix, command,
        Ryuu, replyalya, replytolak
      } = ctx

      if (!Ryuu) return replytolak('❌ Khusus owner!')
      if (!args[0]) return replyalya(`Contoh: ${prefix + command} 628xxx`)

      const targetId = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'

      const begalDB = readBegalDB()
      delete begalDB.bodyguard[targetId]
      writeBegalDB(begalDB)

      if (global.db?.users?.[targetId]) {
        global.db.users[targetId].antibegal = 0
      }

      replyalya(`✅ Bodyguard @${targetId.split('@')[0]} berhasil direset ke 0.`)
    }
  }

]
