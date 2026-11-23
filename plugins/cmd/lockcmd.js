// Plugin: lockcmd
// Auto-generated from Alya V12
// Commands: lockcmd

const path = require('path')

module.exports = {
  command: ["lockcmd"],
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

    if (!Ryuu) return replytolak(mess.only.owner)
    if (!m.quoted) return replyalya('Reply Message!')
    if (!m.quoted.fileSha256) return replyalya('SHA256 Hash Missing')
    let hash = m.quoted.fileSha256.toString('base64')
    if (!(hash in global.db.sticker)) return replyalya('Hash not found in database')
    global.db.sticker[hash].locked = !/^un/i.test(command)
    replyalya('Done!')
  }
}
