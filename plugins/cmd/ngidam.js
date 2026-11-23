// Plugin: ngidam
// Family System V1 - Cek ngidam istri/suami & progress kehamilan
// Commands: ngidam

const path = require('path')

const NGIDAM_LIST = [
  "es krim cokelat", "mangga muda dicocol sambal", "rujak buah pedas",
  "nasi padang rendang", "sushi salmon", "donat cokelat",
  "bakso pedas extra cabe", "seblak", "es kelapa muda",
  "pizza keju mozarella", "soto ayam hangat", "buah duku",
  "mie ayam komplit", "telur asin", "sate kambing"
]

module.exports = {
  command: ["ngidam"],
  tags: ['family'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix, body, budy,
      sender, from, pushname, botNumber,
      reply, replyalya, replytolak, replyprem,
      senderNumber, chath, pes, messagesC, bady,
      waifuList, husbuList, pler, setting, user
    } = ctx

    let users = global.db.users[m.sender]
    users.family ??= {}

    const punyaWaifu = users.waifu && users.waifu.name
    const punyaHusbu = users.husbu && users.husbu.name

    if (!punyaWaifu && !punyaHusbu) {
      return replyalya("😔 Lu belum nikah, gak ada yang lagi hamil.")
    }

    const pregnancy = users.family.pregnancy
    if (!pregnancy || !pregnancy.isPregnant) {
      return replyalya("🙂 Gak ada kehamilan yang sedang berlangsung. Coba program hamil dulu pakai *.promil*.")
    }

    const pasangan = pregnancy.partnerName
    const elapsedMs = Date.now() - pregnancy.startedAt
    const totalMs = 9 * 60 * 60 * 1000 // 9 jam = 9 "bulan"
    const elapsedHours = elapsedMs / (60 * 60 * 1000)
    const bulanKehamilan = Math.min(9, Math.floor(elapsedHours) + 1)
    const sisaMs = totalMs - elapsedMs

    // Sudah waktunya lahiran
    if (elapsedMs >= totalMs) {
      let teks = `👶 *WAKTUNYA LAHIRAN!* 👶\n\n`
      teks += `*${pasangan}* udah masuk bulan ke-9, kandungannya udah cukup umur!\n`
      teks += `Buruan siapin biaya dan ke rumah sakit pakai *.lahiranwaifu*.`
      return replyalya(teks)
    }

    let randomNgidam = NGIDAM_LIST[Math.floor(Math.random() * NGIDAM_LIST.length)]
    let sisaJam = Math.ceil(sisaMs / (60 * 60 * 1000))

    let teks = `🤰 *NGIDAM CHECK* 🤰\n\n`
    teks += `*${pasangan}* lagi hamil bulan ke-${bulanKehamilan} dari 9 bulan.\n\n`
    teks += `Sekarang dia lagi pengen banget makan:\n`
    teks += `🍽️ *${randomNgidam}*\n\n`
    teks += `Demi kesehatan janinnya, usahain penuhi ya!\n`
    teks += `⏳ Sisa waktu menuju lahiran: ±${sisaJam} jam lagi.`

    return alya.sendMessage(m.chat, { text: teks }, { quoted: m })
  }
}
