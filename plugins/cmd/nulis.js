// Plugin: nulis
// Auto-generated from Alya V12
// Commands: nulis

const path = require('path')

module.exports = {
  command: ["nulis"],
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

      if (!text) return m.reply(
        `✍️ *Format Salah!*\n\n` +
        `Contoh:\n${prefix + command} Aku tidak akan malas belajar`
      )
      let userAlt = global.db.users[m.sender]
      let biaya = 1
      if (!isPrem && userAlt.limit < biaya) {
        return m.reply('❌ Limit kamu habis!\nSilakan beli limit melalui `.buy`.')
      }
      if (!isPrem) userAlt.limit -= biaya

      let sisaLimit = userAlt.limit

      await alya.sendMessage(m.chat, {
        react: { text: '✍️', key: m.key }
      })
      try {
        const axios = require('axios')
        const url = `https://api.nexray.web.id/maker/nulis?text=${encodeURIComponent(text)}`
        const res = await axios.get(url, {
          responseType: 'arraybuffer'
        })
        const buffer = Buffer.from(res.data)
        await alya.sendMessage(m.chat, {
          image: buffer,
          caption:
    `✍️ *Tulisan berhasil dibuat!*

    💸 Biaya Limit : ${isPrem ? '0 (Premium)' : biaya}
    📉 Limit Terpotong : ${isPrem ? '0' : biaya}
    📊 Sisa Limit Kamu : ${isPrem ? 'Unlimited ♾️' : sisaLimit}`
        }, { quoted: m })

      } catch (err) {
        console.error(err)
        m.reply('❌ Terjadi kesalahan saat membuat tulisan.')
      }
    }
}
