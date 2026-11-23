// Plugin: smeme
// Claude-made untuk Alya V13 (tidak ada di V10)
// Commands: smeme

const path = require('path')
const axios = require('axios')

module.exports = {
  command: ["smeme"],
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

    if (!text) return replyalya(`✍️ Masukkan teks untuk meme!\n\nContoh: *${prefix}smeme teks atas|teks bawah*`)

    const parts = text.split('|')
    const top = encodeURIComponent(parts[0] ? parts[0].trim() : ' ')
    const bottom = encodeURIComponent(parts[1] ? parts[1].trim() : ' ')

    try {
      // Menggunakan template meme random dari imgflip API (public endpoint)
      const templates = [
        '181913649', // Drake Hotline Bling
        '87743020',  // Two Buttons
        '112126428', // Distracted Boyfriend
        '131087935', // Running Away Balloon
        '188390779', // Task Failed Successfully
        '217743513', // UNO Draw 25 Cards
        '124822590', // Left Exit 12 Off Ramp
        '129242436', // Change My Mind
      ]
      const templateId = templates[Math.floor(Math.random() * templates.length)]
      const memeUrl = `https://api.memegen.link/images/${templateId}/${top}/${bottom}.jpg`

      await alya.sendMessage(m.chat, {
        image: { url: memeUrl },
        caption: `🖼️ *STIKER MEME*\n\n📝 ${parts[0] || '-'}\n📝 ${parts[1] || '-'}`
      }, { quoted: m })
    } catch (e) {
      replyalya('❌ Gagal generate meme. Coba lagi nanti!')
    }
  }
}
