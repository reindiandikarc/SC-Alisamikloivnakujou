// Plugin: cringe
// Ported to Alya V13 from V10
// Commands: cringe

const path = require('path')
const axios = require('axios')

module.exports = {
  command: ["cringe"],
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

    try {
      const { data } = await axios.get(`https://api.waifu.pics/sfw/${command}`)
      await alya.sendImageAsSticker(from, data.url, m, { packname: global.packname || 'Alya', author: global.author || 'Bot' })
    } catch (e) {
      replyalya('❌ Gagal mengambil gambar. Coba lagi nanti!')
    }
  }
}
