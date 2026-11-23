// Plugin: setcmd
// Auto-generated from Alya V12
// Commands: setcmd

const path = require('path')

module.exports = {
  command: ["setcmd"],
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

    if (!m.quoted) return replyalya('Reply Message!')
    if (!m.quoted.fileSha256) return replyalya('SHA256 Hash Missing')
    if (!text) return replyalya(`For What Command?`)
    let hash = m.quoted.fileSha256.toString('base64')
    if (global.db.sticker[hash] && global.db.sticker[hash].locked) return replyalya('You have no permission to change this sticker command')
    global.db.sticker[hash] = {
    text,
    mentionedJid: m.mentionedJid,
    creator: m.sender,
    at: + new Date,
    locked: false,
    }
    replyalya(`Done!`)
  }
}
