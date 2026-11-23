// Plugin: foxgirl
// Claude-made untuk Alya V13 (fox_girl dari nekos.life)
// Commands: foxgirl

const path = require('path')
const axios = require('axios')

module.exports = {
  command: ["foxgirl"],
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
      // nekos.life fox_girl endpoint
      const { data } = await axios.get(`https://nekos.life/api/v2/img/fox_girl`)
      await alya.sendImage(from, data.url, '🦊 *Fox Girl*', m)
    } catch (e) {
      // Fallback ke waifu.pics
      try {
        const { data } = await axios.get(`https://api.waifu.pics/sfw/waifu`)
        await alya.sendImage(from, data.url, '🦊 *Fox Girl*', m)
      } catch {
        replyalya('❌ Gagal mengambil gambar. Coba lagi nanti!')
      }
    }
  }
}
