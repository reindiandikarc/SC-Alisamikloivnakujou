// Plugin: dailykerja
// Ported from Alya V10
// Commands: dailykerja
// Fix: user dari ctx adalah snapshot — pakai global.db.users[m.sender] langsung

const path = require('path')

module.exports = {
  command: ["dailykerja"],
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

        let userData = global.db.users[m.sender]
        if (!userData) return replyalya("User tidak ditemukan!")

        let cooldown = 86400000 // 24 jam

        userData.lastdaily = userData.lastdaily || 0

        if (Date.now() - userData.lastdaily < cooldown) {
            let sisaMs = cooldown - (Date.now() - userData.lastdaily)
            let sisaJam = Math.floor(sisaMs / 3600000)
            let sisaMenit = Math.floor((sisaMs % 3600000) / 60000)
            return replyalya(`⏳ Daily sudah diambil.\nCoba lagi dalam: ${sisaJam}j ${sisaMenit}m`)
        }

        let bonus = 100000
        userData.money = (userData.money || 0) + bonus
        userData.lastdaily = Date.now()

        replyalya(`🎁 Daily Bonus +Rp ${bonus.toLocaleString('id-ID')}\n💰 Total Money: Rp ${userData.money.toLocaleString('id-ID')}`)
  }
}
