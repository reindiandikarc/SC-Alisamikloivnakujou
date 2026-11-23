// Plugin: userjid
// Commands: userjid

const path = require('path')

module.exports = {
  command: ["userjid"],
  tags: ['owner'],
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

    let targetJid
    let targetName

    if (m.mentionedJid && m.mentionedJid[0]) {
      targetJid = m.mentionedJid[0]
      targetName = 'Mentioned User'
    } else if (quoted) {
      targetJid = quoted.sender || quoted.participant
      targetName = quoted.pushname || 'Unknown'
    } else if (text) {
      targetJid = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
      targetName = 'Input Number'
    } else {
      targetJid = sender
      targetName = pushname
    }

    replyalya(`🆔 *User JID Info*\n\n👤 Nama: *${targetName}*\n📌 JID: \`${targetJid}\`\n📞 Nomor: *${targetJid.split('@')[0]}*\n🔗 Chat: *${from}*`)
  }
}
