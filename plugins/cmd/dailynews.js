// Plugin: dailynews
// Auto-generated from Alya V12
// Commands: dailynews

const path = require('path')

module.exports = {
  command: ["dailynews"],
  tags: ['ai'],
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

    DailyNews().then(async(res) => {
    no = 0
    iwannnnnnnnn = ""
    for (let i of res) {
    no += 1
    iwannnnnnnnn += `\n• ${no.toString()} •\n`
    iwannnnnnnnn += `Berita: ${i.berita}\n`
    iwannnnnnnnn += `Link: ${i.berita_url}\n`
    }
    iwannnnnnnnn += ""
    alya.sendMessage(m.chat, { image : { url : res[0].berita_thumb }, caption: iwannnnnnnnn }, { quoted:m })
    })
    }
    //=================================================//
  }
