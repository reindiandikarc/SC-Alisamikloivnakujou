// Plugin: igmp3
// Auto-generated from Alya V12
// Commands: igmp3

const path = require('path')

module.exports = {
  command: ["igmp3"],
  tags: ['downloader'],
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

    const db = global.db
      let biaya = 1
      if (db.users[m.sender].limit < biaya) {
        return replyalya(`❌ Limit kamu tidak cukup!\n\n💡 Limit dibutuhkan: ${biaya}`)
      }

      if (!text) return replyalya('❌ URL Instagram tidak valid')

      await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

      try {
        const axios = require('axios')
        const { igdl } = require('../../scrape/igdl')
        const { toAudio } = require('../../lib/converter')

        const data = await igdl(text)
        const video = data.media.find(m => m.type === 'video')

        if (!video) throw 'Video tidak ditemukan'

        const res = await axios.get(video.download, {
          responseType: 'arraybuffer',
          headers: { 'User-Agent': 'Mozilla/5.0' }
        })

        const audio = await toAudio(Buffer.from(res.data), 'mp4')

        await alya.sendMessage(
          m.chat,
          { audio: audio, mimetype: 'audio/mpeg' },
          { quoted: m }
        )

        db.users[m.sender].limit -= biaya

        await alya.sendMessage(m.chat, { react: { text: '🎵', key: m.key } })

      } catch (err) {
        console.error(err)
        await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        replyalya('❌ Gagal convert ke MP3.')
      }
  }
}
