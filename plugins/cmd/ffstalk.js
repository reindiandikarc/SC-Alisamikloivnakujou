// Plugin: ffstalk
// Auto-generated from Alya V12
// Commands: ffstalk

const path = require('path')

module.exports = {
  command: ["ffstalk"],
  tags: ['info'],
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

    alya.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key }})
    if (!q) return replyalya(`Example ${prefix+command} 946716486`)
    reply(mess.wait)
    const data = await fetchJson(`https://api.yanzbotz.live/api/stalker/free-fire?id=${encodeURIComponent(text)}`)
    const data1 = data.result
    replyalya(`*/ Free Fire Stalker \\*

    Id : ${q}
    Nickname : ${data1}`)
  }
}
