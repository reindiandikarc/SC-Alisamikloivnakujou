// Plugin: threadaudio
// Auto-generated from Alya V12
// Commands: threadaudio

const path = require('path')

module.exports = {
  command: ["threadaudio"],
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

      if (!text) return replyalya('❌ URL Threads tidak valid')

      alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

      try {
        const { threadsdl } = require('../../scrape/threads')
        const data = await threadsdl(text)

        const audio = data.media.find(m => m.mp3)

        if (!audio) throw 'Audio tidak ditemukan'

        await alya.sendMessage(
          m.chat,
          {
            audio: { url: audio.mp3 },
            mimetype: 'audio/mpeg'
          },
          { quoted: m }
        )

        await alya.sendMessage(m.chat, { react: { text: '🎵', key: m.key } })

      } catch (err) {
        console.error(err)
        await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        replyalya('❌ Gagal mengambil audio Threads.')
      }
    }
}
