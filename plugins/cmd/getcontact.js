// Plugin: getcontact
// Auto-generated from Alya V12
// Commands: getcontact

const path = require('path')

module.exports = {
  command: ["getcontact"],
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

    if (!Ryuu) return replytolak(`Khusus Owner Aja`)
    if (!m.isGroup) return replytolak(`Fitur Ini Khusus Group`)
    huhuhs = await alya.sendMessage(m.chat, {
        text: `Grup; *${groupMetadata.subject}*\nTotal peserta; *${participants.length}*`
    }, {quoted: m, ephemeralExpiration: 86400})
    await sleep(1000) // (?); mengirim kontak seluruh member
    alya.sendContact(m.chat, participants.map(a => a.id), huhuhs)

//     	case 'tovidey':
  }
}
