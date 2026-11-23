// Plugin: towl
// Auto-generated from Alya V12
// Commands: towl

const path = require('path')

module.exports = {
  command: ["towl"],
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

    const db = global.db
        if (!Ryuu) return replytolak("Fitur ini hanya bisa digunakan oleh owner.")
        if (!text) return replyalya("Gunakan: towl on / towl off")

        if (q.toLowerCase() === 'on') {
            db.settings[botNumber].whitelistMode = true
            replyalya("✅ Mode *Whitelist* telah diaktifkan. Bot hanya bisa digunakan di grup yang diizinkan.")
        } else if (q.toLowerCase() === 'off') {
            db.settings[botNumber].whitelistMode = false
            replyalya("❌ Mode *Whitelist* telah dimatikan. Bot bisa digunakan di semua grup.")
        } else {
            replyalya("Gunakan: towl on / towl off")
        }
  }
}
