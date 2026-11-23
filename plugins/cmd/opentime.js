// Plugin: opentime
// Auto-generated from Alya V12
// Commands: opentime

const path = require('path')

module.exports = {
  command: ["opentime"],
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

    if (!m.isGroup) return replytolak(mess.only.group)
    if (!isAdmins && !Ryuu) return reply('Khusus Admin!!')
    if (!isBotAdmins) return replytolak('_Bot Harus Menjadi Admin Terlebih Dahulu_')
    if (args[1] == 'second') {
    var timer = args[0] * `1000`
    } else if (args[1] == 'minute') {
    var timer = args[0] * `60000`
    } else if (args[1] == 'hour') {
    var timer = args[0] * `3600000`
    } else if (args[1] == 'day') {
    var timer = args[0] * `86400000`
    } else {
    return replyalya('*Choose:*\nsecond\nminute\nhour\n\n*Example*\n10 second')
    }
    replyalya(`Open Time ${q} Starting from now`)
    setTimeout(() => {
    var nomor = m.participant
    const open = `*On time* Group Opened By Admin\n Now Members Can Send Messages`
    alya.groupSettingUpdate(from, 'not_announcement')
    replyalya(open)
    }, timer)
  }
}
