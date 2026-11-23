// Plugin: sindo
// Auto-generated from Alya V12
// Commands: sindo

const path = require('path')

module.exports = {
  command: ["sindo"],
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

    SindoNews().then(async(res) => {
    no = 0
    iwannnnnnnnnnnn = ""
    for (let i of res) {
    no += 1
    iwannnnnnnnnnnn += `\n• ${no.toString()} •\n`
    iwannnnnnnnnnnn += `Berita: ${i.berita}\n`
    iwannnnnnnnnnnn += `Jenis: ${i.berita_jenis}\n`
    iwannnnnnnnnnnn += `Link: ${i.berita_url}\n`
    }
    iwannnnnnnnnnnn += ""
    reply(iwannnnnnnnnnnn)
    })
    }
    //=================================================//
  }
