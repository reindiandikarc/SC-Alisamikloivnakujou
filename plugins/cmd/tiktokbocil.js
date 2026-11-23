// Plugin: tiktokbocil
// Auto-generated from Alya V12
// Commands: tiktokbocil

const path = require('path')

module.exports = {
  command: ["tiktokbocil"],
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

      if (!isPrem) return replyprem(mess.premium)
    reply(mess.wait)
    var bocil = JSON.parse(fs.readFileSync('./data/AlyaMedia/tiktokvids/bocil.json'))
    var hasil = pickRandom(bocil)
    alya.sendMessage(m.chat, { caption: mess.success, video: { url: hasil.url }}, { quoted: m })
  }
}
