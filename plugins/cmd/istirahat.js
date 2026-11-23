// Plugin: istirahat
// Ported from Alya V10
// Commands: istirahat
// Fix: user dari ctx adalah snapshot — pakai global.db.users[m.sender] langsung

const path = require('path')

module.exports = {
  command: ["istirahat"],
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

        let regen = 30
        userData.stamina = userData.stamina || 0
        userData.stamina += regen
        if (userData.stamina > 100) userData.stamina = 100

        replyalya(`🍺 Kamu beristirahat\nStamina +${regen}\nSekarang: ${userData.stamina}`)
  }
}
