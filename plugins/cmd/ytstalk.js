// Plugin: ytstalk
// Migrated from Alya V10 → V13 Plugin Architecture
// Commands: ytstalk, youtubestalk, stalkyt

module.exports = {
  command: ["ytstalk", "youtubestalk", "stalkyt"],
  tags: ['info'],
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

    if (!text) return m.reply(`Contoh penggunaan: ${prefix}ytstalk NamaChannel`)

    m.reply('⏳ Sedang mengambil info YouTube...')

    try {
      const axios = require('axios')
      const url = `https://api.elrayyxml.web.id/api/stalker/youtube?username=${encodeURIComponent(text)}`
      const { data } = await axios.get(url)

      if (!data.status) return m.reply('❌ Channel tidak ditemukan atau API error.')

      const channel = data.result.channel
      const videos = data.result.latest_videos || []

      let caption = `📺 *YouTube Stalker*\n\n`
      caption += `👤 Username: ${channel.username}\n`
      caption += `🔔 Subscribers: ${channel.subscriberCount}\n`
      caption += `🎥 Video: ${channel.videoCount}\n`
      caption += `📝 Deskripsi: ${channel.description || '-'}\n`
      caption += `🔗 Link: ${channel.channelUrl}\n\n`

      if (videos.length > 0) {
        caption += `📌 *5 Video Terbaru:*\n`
        videos.slice(0, 5).forEach((v, i) => {
          caption += `\n${i + 1}. ${v.title}\n`
          caption += `⏱️ Durasi: ${v.duration}\n`
          caption += `👁️ Views: ${v.viewCount}\n`
          caption += `🕒 Dipublikasikan: ${v.publishedTime}\n`
          caption += `🔗 ${v.videoUrl}\n`
        })
      }

      await alya.sendMessage(m.chat, {
        image: { url: channel.avatarUrl || global.thumb },
        caption: caption
      }, { quoted: m })

    } catch (err) {
      console.error(err)
      m.reply('❌ Gagal mengambil info channel YouTube.')
    }
  }
}
