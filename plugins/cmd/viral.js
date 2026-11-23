// Plugin: viral
// Auto-generated from Alya V12
// Commands: viral

const path = require('path')

module.exports = {
  command: ["viral"],
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

      if (!Ryuu) return replytolak(mess.only.owner)
      alya.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key }})
    var asupan = JSON.parse(fs.readFileSync('./database/anuu.json'))
    var hasil = pickRandom(asupan)
    alya.sendMessage(m.chat, { caption: mess.success, video: { url: hasil.url }}, { quoted: m })
    }
    //==================================================================
  }
