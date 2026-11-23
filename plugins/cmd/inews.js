// Plugin: inews
// Auto-generated from Alya V12
// Commands: inews

const path = require('path')

module.exports = {
  command: ["inews"],
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

    iNews().then(async(res) => {
    no = 0
    iwannnnnnnnnn = ""
    for (let i of res) {
    no += 1
    iwannnnnnnnnn += `\n• ${no.toString()} •\n`
    iwannnnnnnnnn += `Berita: ${i.berita}\n`
    iwannnnnnnnnn += `Upload: ${i.berita_diupload}\n`
    iwannnnnnnnnn += `Jenis: ${i.berita_jenis}\n`
    iwannnnnnnnnn += `Link: ${i.berita_url}\n`
    }
    iwannnnnnnnnn += ""
    reply(iwannnnnnnnnn)
    })
    }
    //=================================================//
  }
