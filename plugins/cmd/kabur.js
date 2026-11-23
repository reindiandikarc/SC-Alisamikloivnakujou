// Plugin: kabur
// Auto-generated from Alya V12
// Commands: kabur

const path = require('path')

module.exports = {
  command: ["kabur"],
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

        let userAlt = global.db.users[m.sender]
        let now = Date.now()

        let isJailKriminal = user.jailUntil && now < user.jailUntil
        let isJailBansos = user.lastbansos && now < user.lastbansos

        if (!isJailKriminal && !isJailBansos) return replyalya("🔒 Kamu gak di penjara. Tidur aja di rumah sana.")

        if (now < (user.lastEscapeAttempt || 0) + (10 * 60 * 1000)) return replyalya("⏳ Lu baru aja nyoba kabur! Penjagaan lagi ketat banget sekarang.")

        user.lastEscapeAttempt = now
        let chance = Math.random()

        if (chance < 0.30) {
            user.jailUntil = 0
            user.lastbansos = 0
            await replyalya("🏃💨 *BERHASIL KABUR!*\n\nLu nemu celah di pagar beton dan lari sekencang mungkin. Sekarang lu bebas, tapi tetap jadi buronan!")
        } else {
            let tambahanWaktu = 60 * 60 * 1000

            if (isJailBansos) user.lastbansos += tambahanWaktu
            if (isJailKriminal) user.jailUntil += tambahanWaktu

            await replyalya("👮 *Gagal Kabur!* 👮\n\nLu ketahuan pas mau manjat pagar! Sipir menghajar lu dan nambah masa tahanan **1 Jam** lagi.")
        }
  }
}
