// Plugin: listwl
// Auto-generated from Alya V12
// Commands: listwl

const path = require('path')

module.exports = {
  command: ["listwl"],
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

        if (!Ryuu) return replytolak("Fitur ini hanya bisa digunakan oleh owner.")
        if (whitelist.length < 1) return replyalya("⚠️ Tidak ada grup di whitelist.")

        let teks = "*📜 Daftar Grup Whitelist:*\n\n"
        for (let id of whitelist) {
            let name = await getGcName(id)
            teks += `🏷️ ${name}\n🆔 ${id}\n\n`
        }
        replyalya(teks)
  }
}
