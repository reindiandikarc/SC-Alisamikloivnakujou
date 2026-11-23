// Plugin: snackvideo
// Auto-generated from Alya V12
// Commands: snackvideo

const path = require('path')

module.exports = {
  command: ["snackvideo"],
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

      if (!text) return reply(mess.query.link)
      reply(mess.query.link)
    const data = fetchJson(`https://api.siputzx.my.id/api/d/snackvideo?url=${encodeURIComponent(text)}`)
    const vidnya = data.result.media || ''
    const cption = data.result.title || ''
    alya.sendMessage(m.chat, { caption: cption, video: { url: vidnya } }, { quoted: m });
  }
}
