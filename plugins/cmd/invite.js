// Plugin: invite
// Auto-generated from Alya V12
// Commands: invite

const path = require('path')

module.exports = {
  command: ["invite"],
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

    	if (!m.isGroup) return replytolak(mess.only.group)
    	if (!isBotAdmins) return replytolak('_Bot Harus Menjadi Admin Terlebih Dahulu_')
    if (!text) return replyalya(`Silakan Masukkan Nomer yang Ingin Anda Invite\n\nContoh :\n*${prefix + command}* 6283166570663`)
    if (text.includes('+')) return replyalya(`Enter the number together without *+*`)
    if (isNaN(text)) return replyalya(`Enter only the numbers plus your country code without spaces`)
    let group = m.chat
    let link = 'https://chat.whatsapp.com/' + await alya.groupInviteCode(group)
          await alya.sendMessage(text+'@s.whatsapp.net', {text: `≡ *GROUP INVITATION*\n\nA user invites you to join this group \n\n${link}`, mentions: [m.sender]})
            replyalya(` An invite link is sent to the user`)
  }
}
