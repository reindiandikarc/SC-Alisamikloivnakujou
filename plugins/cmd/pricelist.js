// Plugin: pricelist
// Auto-generated from Alya V12
// Commands: pricelist

const path = require('path')

module.exports = {
  command: ["pricelist"],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix, body, budy,
      sender, from, pushname, botNumber,
      isCmd, isGroup, isMedia, isImage, isVideo, isAudio, isSticker,
      isQuotedImage, isQuotedVideo, isQuotedSticker, isQuotedAudio,
      isQuotedDocument, isQuotedViewOnce, isQuotedLocation, isQuotedContact,
      groupMetadata, groupName, groupMembers, groupAdmins, groupOwner,
      isBotAdmins, isGroupAdmins, isAdmins, isAdminOrOwner,
      Ryuu, isPrem, isAly, isAlya, isSewa, jangan,
      quoted, mime, qmsg, content, type, chatUpdate, store,
      reply, replyalya, replytolak, replyprem,
      senderNumber, chath, pes, messagesC, bady,
      waifuList, husbuList, pler, setting, user
    } = ctx

    replyalya(`╭━━━━━━━━━━━━━━━━━━━━━╮
    ┃  💎 *PRICELIST SEWA ALYA MD*  💎
    ╰━━━━━━━━━━━━━━━━━━━━━╯

    ━━━━━ 🇲🇾 *MALAYSIA CUSTOMER* ━━━━━
    _Harga khas untuk pelanggan Malaysia_

    *1️⃣ SEWA GROUP BIASA*
    Sesuai untuk group fun, jual-beli, atau komuniti santai.
    ┌─────────────────
    ├ Mingguan   : *RM 3*
    ├ 1 Bulan    : *RM 5*
    ├ 3 Bulan    : *RM 13* _(Limit 100/Minggu)_
    ├ 6 Bulan    : *RM 23* _(Limit 250/Minggu)_
    └ 12 Bulan   : *RM 40* _(Limit Unlimited)_

    *2️⃣ SEWA GROUP PREMIUM*
    Fitur lengkap + priority support 24 jam.
    ┌─────────────────
    ├ Mingguan   : *RM 5*
    ├ 1 Bulan    : *RM 13*
    ├ 3 Bulan    : *RM 33* _(Limit 100/Minggu)_
    ├ 6 Bulan    : *RM 60* _(Limit 250/Minggu)_
    └ 12 Bulan   : *RM 110* _(Limit Unlimited)_

    *3️⃣ MEMBER PREMIUM*
    Buka semua command bot tanpa had.
    ┌─────────────────
    ├ Mingguan   : *RM 2*
    ├ 1 Bulan    : *RM 3*
    ├ 3 Bulan    : *RM 7* _(Limit 100/Minggu)_
    ├ 6 Bulan    : *RM 13* _(Limit 250/Minggu)_
    └ 12 Bulan   : *RM 23* _(Limit Unlimited)_

    💳 *CARA BAYAR (MY):*
    *Pilihan 1 — Bank Transfer*
    _(Wise, BigPay, Instarem, Touch 'n Go GOremit)_
    ├ Bank  : *MANDIRI*
    ├ No Rek: *1390034141659*
    ├ Nama  : *Muji Eko Rostalina*
    └ Remark: _Nama + Paket Sewa_

    *Pilihan 2 — QRIS*
    _(GoPay, OVO, DANA, ShopeePay, m-banking ID)_
    └ Scan QR → masukkan jumlah → auto convert ke Rupiah

    ━━━━━ 🇮🇩 *INDONESIA CUSTOMER* ━━━━━

    *1️⃣ SEWA GRUP BIASA*
    ┌─────────────────
    ├ Per Minggu : *Rp 5.000*
    ├ 1 Bulan   : *Rp 10.000*
    ├ 3 Bulan   : *Rp 25.000*
    ├ 6 Bulan   : *Rp 45.000*
    ├ 12 Bulan  : *Rp 80.000*
    └ Permanen  : *Rp 150.000*

    *2️⃣ SEWA GRUP PREMIUM* ⭐
    _Semua anggota bebas addlimit + pembagian user premium!_
    ┌─────────────────
    ├ Per Minggu : *Rp 10.000*
    ├ 1 Bulan   : *Rp 25.000* _(10 usr premium)_
    ├ 3 Bulan   : *Rp 65.000* _(20 usr premium)_
    ├ 6 Bulan   : *Rp 90.000* _(30 usr premium)_
    ├ 12 Bulan  : *Rp 160.000* _(40 usr premium)_
    └ Permanen  : *Rp 300.000* _(50 usr premium)_

    *3️⃣ MEMBER PREMIUM*
    ┌─────────────────
    ├ Per Minggu : *Rp 3.000*
    ├ 1 Bulan   : *Rp 5.000*
    ├ 3 Bulan   : *Rp 13.000*
    ├ 6 Bulan   : *Rp 25.000*
    ├ 12 Bulan  : *Rp 45.000*
    └ Permanen  : *Rp 100.000*

    📌 *SYARAT & KETENTUAN:*
    1. Alya aktif 24 jam (kecuali maintenance)
    2. Dilarang spam/kirim virus/virtex
    3. Garansi aktif sesuai durasi sewa
    4. Pembayaran yang masuk tidak bisa ditarik kembali

    💳 *PEMBAYARAN (ID):*
    └ QRIS — DANA, OVO, GoPay ✅

    🛒 *CARA ORDER:*
    Ketik *${prefix}owner* untuk hubungi Owner
    atau WhatsApp: *wa.me/6285602845953*

    _Aktif segera setelah pembayaran & resit disahkan!_ 🚀`)
  }
}
