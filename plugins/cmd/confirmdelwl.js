// Plugin: confirmdelwl
// Auto-generated from Alya V12
// Commands: confirmdelwl

const path = require('path')

module.exports = {
  command: ["confirmdelwl"],
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

        if (!Ryuu) return replytolak("❌ Hanya owner yang bisa menggunakan perintah ini.")
        if (!text) return replyalya("❌ ID grup tidak ditemukan.")

        let id = text.trim()

        if (!whitelist.includes(id)) {
            return replyalya("⚠️ Grup tidak ada di whitelist.")
        }

        whitelist = whitelist.filter(g => g !== id)
        saveWhitelist()

        replyalya(`✅ Berhasil menghapus grup dari whitelist:\n🆔 ${id}`)
  }
}
