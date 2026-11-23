// Plugin: define
// Auto-generated from Alya V12
// Commands: define

const path = require('path')

module.exports = {
  command: ["define"],
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

    if (!q) return replyalya(`What do you want to define?`)
    try {
    targetfine = await axios.get(`http://api.urbandictionary.com/v0/define?term=${q}`)
    if (!targetfine) return replyalya(mess.error)
    let reply =`
    *${themeemoji} Word:* ${q}
    *${themeemoji} Definition:* ${targetfine.data.list[0].definition
        .replace(/\[/g, "")
        .replace(/\]/g, "")}
    *${themeemoji} Example:* ${targetfine.data.list[0].example
        .replace(/\[/g, "")
        .replace(/\]/g, "")}`
       alya.sendMessage(m.chat,{text:reply},{quoted:m})
    } catch (err) {
        console.log(err)
        return replyalya(`*${q}* isn't a valid text`)
  }
}
}
