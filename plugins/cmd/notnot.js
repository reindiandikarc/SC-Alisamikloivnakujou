// Plugin: notnot
// Auto-generated from Alya V12
// Commands: notnot

const path = require('path')

module.exports = {
  command: ["notnot"],
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

    reply(mess.wait)
    var notnot = JSON.parse(fs.readFileSync('./data/AlyaMedia/randompics/notnot.json'))
    var hasil = pickRandom(notnot)
    alya.sendMessage(m.chat, { caption: mess.success, image: { url: hasil.url } }, { quoted: m })
  }
}
