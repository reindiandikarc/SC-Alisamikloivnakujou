// Plugin: ppcouple
// Ported to Alya V13 from V10
// Commands: ppcouple, couplepp

const path = require('path')
const axios = require('axios')

module.exports = {
  command: ["ppcouple", "couplepp"],
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

    replyalya(global.mess ? global.mess.wait : '⏳ Sabar...')
    try {
      const { data: anucpp } = await axios.get('https://raw.githubusercontent.com/DGXeon/XeonMedia/main/couple.json')
      const random = anucpp[Math.floor(Math.random() * anucpp.length)]
      await alya.sendMessage(m.chat, { image: { url: random.male }, caption: `Couple Male 👦` }, { quoted: m })
      await alya.sendMessage(m.chat, { image: { url: random.female }, caption: `Couple Female 👧` }, { quoted: m })
    } catch (e) {
      replyalya('❌ Gagal mengambil gambar couple. Coba lagi nanti!')
    }
  }
}
