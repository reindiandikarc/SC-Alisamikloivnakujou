// Plugin: kaorinusantara
// Fixed for Alya V13 - Pinterest powered
// Commands: kaorinusantara

module.exports = {
  command: ["kaorinusantara"],
  tags: ['anime'],
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

    const query = "kaori anime nusantara"

    await alya.sendMessage(m.chat, { react: { text: '🔎', key: m.key } })

    try {
      const { searchPinterest } = require('../../lib/pinterestHelper')
      const imageUrl = await searchPinterest(query)

      if (!imageUrl) return replyalya('❌ Gambar tidak ditemukan. Coba lagi.')

      await alya.sendMessage(m.chat, {
        image: { url: imageUrl },
        caption: `🖼️ *${query}*\n\n_Powered by Pinterest_`
      }, { quoted: m })

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
      console.error('[Pinterest Plugin Error]', e.message)
      replyalya('❌ Gagal mengambil gambar dari Pinterest.')
    }
  }
}
