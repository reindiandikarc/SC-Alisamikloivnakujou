// Plugin: couple
// Ported to Alya V13 from V10
// Commands: couple

const path = require('path')

module.exports = {
  command: ["couple"],
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

    const member = groupMembers.map(u => u.id)
    const orang = member[Math.floor(Math.random() * member.length)]
    const jodoh = member[Math.floor(Math.random() * member.length)]

    alya.sendMessage(m.chat, {
      text: `@${orang.split('@')[0]} ❤️ @${jodoh.split('@')[0]}\nCieeee, What's Going On ❤️💖👀`,
      mentions: [orang, jodoh]
    }, { quoted: m })
  }
}
