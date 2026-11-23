// Plugin: jalantikus
// Auto-generated from Alya V12
// Commands: jalantikus

const path = require('path')

module.exports = {
  command: ["jalantikus"],
  tags: ['admin'],
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

    var reis = await JalanTikusMeme()
    tekcs = ""
    tekcs += "Jalan Tikus Meme\n\n"
    tekcs += `Source: ${reis}`
    tekcs += ""
    alya.sendMessage(m.chat, { image : { url : reis }, caption: tekcs }, { quoted:m })
    }
    //=================================================//
  }
