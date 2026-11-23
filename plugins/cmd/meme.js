// Plugin: meme
// Auto-generated from Alya V12
// Commands: smeme, meme

const path = require('path')

module.exports = {
  command: ["smeme", "meme"],
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

      if (!m.quoted) return replyalya(
        `⚠️ *Reply gambar* dulu baru ketik teks meme nya!\n\n` +
        `*Format:*\n` +
        `• ${prefix}smeme teks atas | teks bawah\n` +
        `• ${prefix}smeme teks (hanya bawah)\n\n` +
        `*Contoh:*\n${prefix}smeme Ketika udah belajar | Soalnya beda semua 💀`
      )

      const quotedMime = (m.quoted.msg || m.quoted).mimetype || ''
      if (!/image/.test(quotedMime)) return replyalya('⚠️ Yang di-reply harus *gambar* ya, bukan video/stiker!')
      if (!text) return replyalya(`⚠️ Teks meme nya mana?\n\n*Format:* ${prefix}smeme teks atas | teks bawah`)

      await alya.sendMessage(m.chat, { react: { text: '🎭', key: m.key } })

      try {
        const { createCanvas, loadImage } = require('canvas')
        const mediaBuff = await m.quoted.download()
        const img = await loadImage(mediaBuff)

        const W = img.width
        const H = img.height
        const canvas = createCanvas(W, H)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, W, H)

        // Parse teks atas dan bawah
        const parts = text.split('|')
        const topText    = (parts.length > 1 ? parts[0].trim() : '').toUpperCase()
        const bottomText = (parts.length > 1 ? parts[1].trim() : parts[0].trim()).toUpperCase()

        // Ukuran font adaptif berdasar lebar gambar
        const fontSize = Math.max(Math.floor(W / 10), 32)
        ctx.font       = `bold ${fontSize}px Impact, Arial Black, sans-serif`
        ctx.textAlign  = 'center'
        ctx.textBaseline = 'top'

        // Fungsi gambar teks dengan stroke tebal (gaya meme klasik)
        function drawMemeText(ctx, txt, x, y) {
          ctx.lineWidth   = fontSize / 5
          ctx.strokeStyle = '#000000'
          ctx.lineJoin    = 'round'
          ctx.strokeText(txt, x, y)
          ctx.fillStyle   = '#FFFFFF'
          ctx.fillText(txt, x, y)
        }

        // Teks atas
        if (topText) {
          drawMemeText(ctx, topText, W / 2, fontSize * 0.2)
        }

        // Teks bawah — baseline jadi 'bottom'
        if (bottomText) {
          ctx.textBaseline = 'bottom'
          drawMemeText(ctx, bottomText, W / 2, H - fontSize * 0.2)
        }

        const buffer = canvas.toBuffer('image/jpeg', { quality: 0.92 })
        await alya.sendMessage(m.chat, {
          image: buffer,
          caption: '🎭 *Meme siap!*'
        }, { quoted: m })
        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

      } catch (err) {
        console.error('[smeme] error:', err)
        await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        replyalya('❌ Gagal bikin meme. Pastiin gambarnya valid ya~')
      }
  }
}
