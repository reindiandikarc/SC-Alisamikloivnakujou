// Plugin: soulmate
// Claude-made untuk Alya V13 (tidak ada di V10)
// Commands: soulmate

const path = require('path')

module.exports = {
  command: ["soulmate"],
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

    const member = groupMembers.map(u => u.id).filter(id => id !== sender)
    if (member.length === 0) return replyalya('👥 Tidak ada member lain di grup ini!')

    const jodoh = member[Math.floor(Math.random() * member.length)]
    const persen = Math.floor(Math.random() * 41) + 60 // 60-100%

    const hearts = ['❤️', '💕', '💗', '💓', '💞', '💘', '💖']
    const heart = hearts[Math.floor(Math.random() * hearts.length)]

    alya.sendMessage(m.chat, {
      text: `${heart} *SOULMATE FINDER* ${heart}\n\n` +
        `@${sender.split('@')[0]}, jiwa yang cocok untukmu adalah...\n\n` +
        `💑 @${jodoh.split('@')[0]}\n` +
        `💯 Kecocokan: *${persen}%*\n\n` +
        `_Kalian ditakdirkan bersama!_ ✨`,
      mentions: [sender, jodoh]
    }, { quoted: m })
  }
}
