// Plugin: getmsg
// Auto-generated from Alya V12
// Commands: getmsg

const path = require('path')

module.exports = {
  command: ["getmsg"],
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

    if (!text) return replyalya(`Example : ${prefix + command} file name\n\nView list of messages with ${prefix}listmsg`)
    let msgs = global.db.database
    if (!(text.toLowerCase() in msgs)) return replyalya(`'${text}' not listed in the message list`)
    alya.copyNForward(m.chat, msgs[text.toLowerCase()], true)
  }
}
