// Plugin: delcmd
// Auto-generated from Alya V12
// Commands: delcmd

const path = require('path')

module.exports = {
  command: ["delcmd"],
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

    let hash = m.quoted.fileSha256.toString('base64')
    if (!hash) return replyalya(`No hashes`)
    if (global.db.sticker[hash] && global.db.sticker[hash].locked) return replyalya('You have no permission to delete this sticker command')
    delete global.db.sticker[hash]
    replyalya(`Done!`)
  }
}
