// Plugin: addwl
// Auto-generated from Alya V12
// Commands: addwl

const path = require('path')

module.exports = {
  command: ["addwl"],
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

        if (!m.isGroup) return replyalya("❌ Perintah ini hanya bisa digunakan di dalam grup.")
        if (!Ryuu) return replytolak("❌ Hanya owner yang bisa menggunakan perintah ini.")

        if (whitelist.includes(m.chat)) {
            return replyalya("⚠️ Grup ini sudah ada di *whitelist*.")
        }

        whitelist.push(m.chat)
        saveWhitelist()
        replyalya("✅ Grup ini berhasil ditambahkan ke *whitelist*.")
  }
}
