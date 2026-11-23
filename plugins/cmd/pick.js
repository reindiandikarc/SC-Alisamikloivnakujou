// Plugin: pick
// Ported to Alya V13 from V10
// Commands: pick

const path = require('path')

module.exports = {
  command: ["pick"],
  tags: ['fun'],
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
      waifuList, husbuList, pler, setting, user,
      mentionByTag, mentionByReply, participants
    } = ctx

    if (!isGroup) return replytolak('❌ Perintah ini hanya bisa digunakan di grup!')
    if (!text) return replyalya(`Apa yang mau kamu pick?\nContoh: ${prefix + command} idiot`)

    const member = groupMembers.map(u => u.id)
    const picked = member[Math.floor(Math.random() * member.length)]

    alya.sendMessage(from, {
      text: `Yang paling *${text}* di sini adalah *@${picked.split('@')[0]}*`,
      mentions: [picked]
    }, { quoted: m })
  }
}
