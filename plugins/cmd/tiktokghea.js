// Plugin: tiktokghea
// Auto-generated from Alya V12
// Commands: tiktokghea

const path = require('path')

module.exports = {
  command: ["tiktokghea"],
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
    var gheayubi = JSON.parse(fs.readFileSync('./data/AlyaMedia/tiktokvids/gheayubi.json'))
    var hasil = pickRandom(gheayubi)
    alya.sendMessage(m.chat, { caption: mess.success, video: { url: hasil.url }}, { quoted: m })
  }
}
