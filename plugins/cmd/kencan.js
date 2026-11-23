// Plugin: kencan
// Fixed for V13: remove wrong cerai alias
// Commands: kencan

const path = require('path')

module.exports = {
  command: ["kencan"],
  tags: ['romance'],
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

        let users = global.global.db.users[m.sender]
        if (!users.waifu || !users.waifu.name) return replyalya("😔 Lu masih jomblo bray! Nikah dulu sana di *.gachawaifu*.")

        const KENCAN_PRICE = 250000
        if (users.money < KENCAN_PRICE) return replyalya(`💸 Uang lu kurang buat ngajak jalan. Butuh Rp ${KENCAN_PRICE.toLocaleString()} buat modal kencan (makan, nonton, dll).`)

        users.lastKencan ??= 0
        let cooldown = 3600000 // 1 jam
        let timeLapse = Date.now() - users.lastKencan
        if (timeLapse < cooldown) {
            let sisa = Math.ceil((cooldown - timeLapse) / 60000)
            return replyalya(`⏳ Istri lu masih capek habis jalan-jalan tadi. Biarin dia istirahat dulu, tunggu ${sisa} menit lagi ya.`)
        }

        users.money -= KENCAN_PRICE
        users.lastKencan = Date.now()

        users.waifu.affection ??= 0
        let affectionGain = Math.floor(Math.random() * 15) + 10
        users.waifu.affection += affectionGain

        let teks = `💖 *KENCAN ROMANTIS* 💖\n\n`
        teks += `Lu baru aja ngajak jalan *${users.waifu.name}*.\n`
        teks += `Kalian makan enak dan jalan-jalan bareng. Dia kelihatan seneng banget!\n\n`
        teks += `💸 Saldo berkurang Rp ${KENCAN_PRICE.toLocaleString()}\n`
        teks += `📈 Affection (Kasih Sayang) bertambah +${affectionGain} poin!\n`
        teks += `💞 Total Affection: ${users.waifu.affection}`

        replyalya(teks)
  }
}
