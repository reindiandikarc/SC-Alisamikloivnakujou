// Plugin: infoprem
// Alya V13 — Harga & Info Premium Bot
// Commands: infoprem

const path = require('path')
const fs = require('fs')

module.exports = {
  command: ['infoprem'],
  tags: ['info'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, prefix,
      sender, from, pushname,
      reply, replyalya
    } = ctx

    const teks =
`╔══════════════════════════════════╗
║   💎  *HARGA SEWA ALYA BOT*  💎   
╚══════════════════════════════════╝

*HARGA SEWA GRUP & MEMBER PREMIUM*
*ALYA MD ID CUSTOMER* ✨

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏠 *Sewa Grup Biasa:*
┌─────────────────────────
│ Per Minggu   : Rp 5.000
│ 1 Bulan      : Rp 10.000
│ 3 Bulan      : Rp 25.000
│ 6 Bulan      : Rp 45.000
│ 12 Bulan     : Rp 80.000
│ Permanen     : Rp 150.000
└─────────────────────────

👑 *Sewa Grup Premium:*
_(*YANG BIKIN BEDA?* Semua anggota grup bebas mau addlimit berapa, dan pembagian user premium)_
┌─────────────────────────
│ Per Minggu   : Rp 10.000
│ 1 Bulan      : Rp 25.000  *(10 usr premium)*
│ 3 Bulan      : Rp 65.000  *(20 usr premium)*
│ 6 Bulan      : Rp 90.000  *(30 usr premium)*
│ 12 Bulan     : Rp 160.000 *(40 usr premium)*
│ Permanen     : Rp 300.000 *(50 usr premium)*
└─────────────────────────
_Jadi tinggal di pilih admin kalian sendiri siapa aja yang dapat_

⭐ *Sewa Member Premium:*
┌─────────────────────────
│ Per Minggu   : Rp 3.000
│ 1 Bulan      : Rp 5.000
│ 3 Bulan      : Rp 13.000
│ 6 Bulan      : Rp 25.000
│ 12 Bulan     : Rp 45.000
│ Permanen     : Rp 100.000
└─────────────────────────

_Minat yang mana? PM aja_ 🚀

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 *SYARAT & KETENTUAN:*

   1. Alya aktif 24 jam (kecuali maintenance/perbaikan).
   2. Dilarang spam atau kirim virus/virtex.
   3. Garansi aktif sesuai durasi sewa yang dipilih.
   4. Pembayaran yang sudah masuk tidak dapat ditarik kembali.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💳 *METODE PEMBAYARAN:*
• All Payment QRIS (DANA, OVO, GoPay)

🛒 *CARA ORDER:*
Ketik: *${prefix}owner* untuk langsung hubungi Owner.
WhatsApp: wa.me/6285602845953

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*© 2026 Alya Tech • All Rights Reserved* 🌸`

    // Kirim gambar QRIS + caption harga
    const qrisPath = path.join(__dirname, '../../database/qris.png')

    if (fs.existsSync(qrisPath)) {
      await alya.sendMessage(m.chat, {
        image: fs.readFileSync(qrisPath),
        caption: teks,
        mentions: [sender]
      }, { quoted: m })
    } else {
      // Fallback: kirim teks saja jika gambar tidak ditemukan
      await alya.sendMessage(m.chat, {
        text: teks,
        mentions: [sender]
      }, { quoted: m })
    }
  }
}
