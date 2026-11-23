// Plugin: film
// Auto-generated from Alya V12
// Commands: starmax, film

const path = require('path')

module.exports = {
  command: ["starmax", "film"],
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

      if (!text) return m.reply(`Contoh:\n${prefix + command} https://xxxx.com/movie-page`)

      const { starmaxfilmdl } = require('../../lib/sm')

      try {
        await m.reply('🔎 Sedang mengambil data...')

        const res = await starmaxfilmdl(text)

        if (!res || !res.title) return m.reply('Data tidak ditemukan!')

        let caption = `🎬 *${res.title}*\n\n`

        if (res.rating) caption += `⭐ Rating: ${res.rating}\n\n`
        if (res.description) caption += `📖 ${res.description}\n\n`

        caption += `📌 *Detail:*\n`
        for (let key in res.details) {
          caption += `• ${key.toUpperCase()} : ${res.details[key]}\n`
        }

        caption += `\n📥 *Download Links:*\n`

        res.downloads.slice(0, 15).forEach((dl, i) => {
          caption += `\n${i + 1}. ${dl.category}`
          caption += `\n   🗂 Provider : ${dl.provider}`
          caption += `\n   🌎 Language : ${dl.language}`
          caption += `\n   📺 Resolution : ${dl.resolution}`
          caption += `\n   🔗 ${dl.url}\n`
        })

        if (res.thumbnail) {
          await alya.sendMessage(m.chat, {
            image: { url: res.thumbnail },
            caption: caption
          }, { quoted: m })
        } else {
          await m.reply(caption)
        }

      } catch (err) {
        console.log(err)
        m.reply('❌ Terjadi kesalahan saat mengambil data!')
      }
    }
//     	case 'cekself':
  }
