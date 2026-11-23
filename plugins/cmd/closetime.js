// Plugin: closetime
// Auto-generated from Alya V12
// Commands: closetime

const path = require('path')

module.exports = {
  command: ["closetime"],
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
    replyalya(`Close Time ${q} Starting from now`)
    setTimeout(() => {
    var nomor = m.participant
    const close = `*On time* Group Closed By Admin\nNow Only Admins Can Send Messages`
    alya.groupSettingUpdate(from, 'announcement')
    replyalya(close)
    }, timer)

//                 case 'delete': case 'del': {
    if (!m.quoted) return replyalya('\u274C Reply pesan yang ingin dihapus terlebih dahulu!')
    const _botJid = alya.user.id.split(':')[0] + '@s.whatsapp.net'
    const _isFromBot = m.quoted.fromMe || m.quoted.sender === _botJid
    // Siapapun bisa hapus pesan bot sendiri; hapus pesan orang lain hanya admin/owner
    if (!_isFromBot && !isAdmins && !Ryuu) return replytolak('\u274C Hanya Admin yang bisa menghapus pesan orang lain!')
    await alya.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: _isFromBot,
        id: m.quoted.id,
        participant: m.quoted.sender
      }
    })
    if (_isFromBot) await alya.sendMessage(m.chat, { react: { text: '\uD83D\uDDD1\uFE0F', key: m.key } })
// [REMOVED]                 case '>l': {
    if (!m.quoted) throw false
    let { chat, id } = m.quoted
     alya.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.quoted.id, participant: m.quoted.sender } })
// [REMOVED]                 case 'linkgroup': case 'linkgc': case 'gclink': case 'grouplink': {
    if (!m.isGroup) return replytolak(mess.only.group)
    if (!isBotAdmins) return replytolak('_Bot Harus Menjadi Admin Terlebih Dahulu_')
    let response = await alya.groupInviteCode(m.chat)
    alya.sendText(m.chat, `https://chat.whatsapp.com/${response}\n\nGroup Link : ${groupMetadata.subject}`, m, { detectLink: true })
  }
}
