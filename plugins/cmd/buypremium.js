// Plugin: buypremium
// Commands: buypremium
// Beli premium otomatis dengan bayar sejumlah money dari RPG
// V20 — by Alya

'use strict'

const HARGA_PREMIUM = 1_781_994_000_000

module.exports = {
  command: ['buypremium'],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const {
      prefix, sender, args, q,
      reply, replyalya, replytolak,
      isPrem, Ryuu,
      user,
      fs, prem
    } = ctx

    const userData = global.db?.users?.[sender]
    if (!userData) return replyalya('❌ Data kamu tidak ada! Daftar dulu ya.')

    // Sudah premium
    if (isPrem) {
      return replyalya(
        `╔══〔 💎 *PREMIUM STATUS* 〕══╗\n` +
        `┃\n` +
        `┃  ✅ Kamu sudah *PREMIUM*!\n` +
        `┃  Nikmati semua fitur premium\n` +
        `┃  tanpa batasan 🎉\n` +
        `┃\n` +
        `╚══════════════════════════╝`
      )
    }

    const uang = userData.money || 0

    // Tampilkan info jika tanpa argumen
    if (!args[0]) {
      const rupiah = (n) => 'Rp ' + n.toLocaleString('id-ID')
      const kurang = Math.max(0, HARGA_PREMIUM - uang)

      return replyalya(
        `╔══〔 💎 *BELI PREMIUM* 〕══╗\n` +
        `┃\n` +
        `┃  💎 Harga Premium:\n` +
        `┃  *${rupiah(HARGA_PREMIUM)}*\n` +
        `┃\n` +
        `┃  💰 Uangmu: *${rupiah(uang)}*\n` +
        `┃  ${uang >= HARGA_PREMIUM
            ? '✅ Cukup! Kamu bisa beli sekarang'
            : `❌ Kurang: *${rupiah(kurang)}*`}\n` +
        `┃\n` +
        `╠══════════════════════════╣\n` +
        `┃  🌟 *Keuntungan Premium:*\n` +
        `┃  • Akses semua fitur premium\n` +
        `┃  • Limit command lebih banyak\n` +
        `┃  • Priority response bot\n` +
        `┃  • Badge 💎 di profil\n` +
        `┃\n` +
        `╠══════════════════════════╣\n` +
        `┃  Cara beli:\n` +
        `┃  *${prefix}buypremium confirm*\n` +
        `┃\n` +
        `╚══════════════════════════╝`
      )
    }

    // Harus ketik confirm
    if (args[0].toLowerCase() !== 'confirm') {
      return replyalya(
        `⚠️ Ketik *${prefix}buypremium confirm* untuk konfirmasi pembelian.\n\n` +
        `💰 Uangmu akan berkurang *Rp ${HARGA_PREMIUM.toLocaleString('id-ID')}*`
      )
    }

    // Cek saldo cukup
    if (uang < HARGA_PREMIUM) {
      const rupiah = (n) => 'Rp ' + n.toLocaleString('id-ID')
      return replytolak(
        `❌ *Uang tidak cukup!*\n\n` +
        `💰 Punya   : *${rupiah(uang)}*\n` +
        `💎 Butuh   : *${rupiah(HARGA_PREMIUM)}*\n` +
        `📉 Kurang  : *${rupiah(HARGA_PREMIUM - uang)}*\n\n` +
        `Kumpulkan uang dulu pakai:\n` +
        `• *${prefix}kerja* — bekerja\n` +
        `• *${prefix}mining* — tambang\n` +
        `• *${prefix}dungeon start* — dungeon`
      )
    }

    // ── Proses pembelian ──
    // Potong uang
    userData.money = uang - HARGA_PREMIUM

    // Tambahkan ke array prem (runtime + file)
    // Cari JID yang benar
    let jid = sender
    try {
      const cek = await alya.onWhatsApp(sender)
      if (cek && cek[0]?.jid) jid = cek[0].jid
    } catch (_) {}

    if (!prem.includes(jid)) {
      prem.push(jid)
      try {
        fs.writeFileSync('./database/premium.json', JSON.stringify(prem))
      } catch (e) {
        console.error('[buypremium] gagal tulis premium.json:', e.message)
      }
    }

    // Juga set flag di user db
    userData.premium = true

    const rupiah = (n) => 'Rp ' + n.toLocaleString('id-ID')
    const waktu = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }) + ' WIB'

    return alya.sendMessage(m.chat, {
      text:
        `╔══〔 💎 *PREMIUM BERHASIL!* 〕══╗\n` +
        `┃\n` +
        `┃  🎉 Selamat! Kamu kini *PREMIUM*!\n` +
        `┃\n` +
        `╠═══════════════════════════════╣\n` +
        `┃  🧾 *RINCIAN TRANSAKSI:*\n` +
        `┃  💎 Paket     : Premium\n` +
        `┃  💰 Dibayar   : ${rupiah(HARGA_PREMIUM)}\n` +
        `┃  💵 Sisa uang : ${rupiah(userData.money)}\n` +
        `┃  🕒 Waktu     : ${waktu}\n` +
        `┃  👤 Akun      : @${sender.split('@')[0]}\n` +
        `┃\n` +
        `╠═══════════════════════════════╣\n` +
        `┃  🌟 *Fitur Premium aktif:*\n` +
        `┃  • Semua fitur premium terbuka\n` +
        `┃  • Limit command premium\n` +
        `┃  • Priority response\n` +
        `┃\n` +
        `╚═══════════════════════════════╝`,
      mentions: [sender]
    }, { quoted: m })
  }
}
