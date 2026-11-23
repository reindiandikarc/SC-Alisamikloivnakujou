// Plugin: autoread
// Auto-generated from Alya V12
// Commands: autoread

const path = require('path')

module.exports = {
  command: ["autoread"],
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
                    if (!Ryuu) return replytolak(mess.only.owner)
                    if (args.length < 1) return replyalya(`Contoh: ${prefix + command} on/off`)
                    if (q === 'on') {
                        db.settings[botNumber].autoread = true
                        reply(`Berhasil mengubah autoread menjadi ${q}`)
                    } else if (q === 'off') {
                        db.settings[botNumber].autoread = false
                        reply(`Berhasil mengubah autoread menjadi ${q}`)
                    }
  }
}
