// Plugin: myip
// Auto-generated from Alya V12
// Commands: myip

const path = require('path')

module.exports = {
  command: ["myip"],
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
    var http = require('http')
    http.get({
    'host': 'api.ipify.org',
    'port': 80,
    'path': '/'
    }, function(resp) {
    resp.on('data', function(ip) {
        replyalya("🔎 Ip Andreas Anda Adalah: " + ip)
    })
    })
                }
}
