// Plugin: rumahsakit
// Ported from Alya V10
// Commands: rumahsakit
// Fix: user dari ctx adalah snapshot — pakai global.db.users[m.sender] langsung

const path = require('path')

module.exports = {
  command: ["rumahsakit"],
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

        if (!userData.pingsan) return replyalya("Kamu tidak pingsan.")

        let biaya = 100000
        if ((userData.money || 0) < biaya) return replyalya(`Uang tidak cukup.\nDibutuhkan: Rp ${biaya.toLocaleString('id-ID')}`)

        userData.money -= biaya
        userData.pingsan = false
        userData.stamina = 50

        replyalya(`🏥 Dirawat di rumah sakit\nBiaya: Rp ${biaya.toLocaleString('id-ID')}\nStamina: 50`)
  }
}
