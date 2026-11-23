// Plugin: addmsg
// Auto-generated from Alya V12
// Commands: addmsg

const path = require('path')

module.exports = {
  command: ["addmsg"],
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

    if (!m.quoted) return replyalya('Reply Message You Want To Save In Database')
    if (!text) return replyalya(`Example : ${prefix + command} filename`)
    let msgs = global.db.database
    if (text.toLowerCase() in msgs) return replyalya(`'${text}' registered in the message list`)
    msgs[text.toLowerCase()] = quoted.fakeObj
    replyalya(`Successfully added message in message list as '${text}'

    Access with ${prefix}getmsg ${text}

    View list of Messages With ${prefix}listmsg`)
  }
}
