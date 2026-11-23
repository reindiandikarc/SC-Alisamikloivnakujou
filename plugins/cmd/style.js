// Plugin: style
// Auto-generated from Alya V12
// Commands: style

const path = require('path')

module.exports = {
  command: ["style"],
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

    		let { styletext } = require('../../lib/scraper')
    		if (!text) return replyalya('Enter Query text!')
    let anu = await styletext(text)
    let teks = `Style Text From ${text}\n\n`
    for (let i of anu) {
    teks += `${themeemoji} *${i.name}* : ${i.result}\n\n`
    }
    replyalya(teks)
  }
}
