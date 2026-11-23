// Plugin: cnn
// Auto-generated from Alya V12
// Commands: cnn

const path = require('path')

module.exports = {
  command: ["cnn"],
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

    CNNNews().then(res => {
    no = 0
    iwann = ""
    for (let i of res) {
    no += 1
    iwann += `\n• ${no.toString()} •\n`
    iwann += `Berita: ${i.berita}\n`
    iwann += `Link: ${i.berita_url}\n`
    }
    iwann += ""
    reply(iwann)
    })
    }
    //=================================================//
  }
