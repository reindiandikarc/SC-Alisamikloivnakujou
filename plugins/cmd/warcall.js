// Plugin: warcall
// Auto-generated from Alya V12
// Commands: warcall

const path = require('path')

module.exports = {
  command: ["warcall"],
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

     if (!m.isGroup) return replytolak(mess.only.group)
    if(!text) return reply(`contoh: \n.warcall kontol`)
    alya.relayMessage(m.chat, {
    scheduledCallCreationMessage: {
    callType: 2,
    scheduledTimestampMs:  Date.now(),
    title: text
    }
    }, {})
  }
}
