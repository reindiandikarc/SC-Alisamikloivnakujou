// Plugin: alyabrat
// Auto-generated from Alya V12
// Commands: alyabrat

const path = require('path')

module.exports = {
  command: ["alyabrat"],
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

    const db = global.db
      const { createCanvas, loadImage, registerFont } = require('canvas')
      const axios = require('axios')
      const { createSticker, StickerTypes } = require('wa-sticker-formatter')

      registerFont('./data/assets/FontsFree-Net-SFProDisplay-Bold.ttf', { family: 'SF Bold' })

      if (!text) return reply('Teksnya mana bang')

      let biaya = 1
      if (db.users[m.sender].limit < biaya) {
        return replyalya(`❌ Limit kamu tidak cukup!\n\n💡 Limit dibutuhkan: ${biaya}`)
      }
      await alya.sendMessage(m.chat, { react: { text: "⏳", key: m.key }})
      try {
        const imageUrl = 'https://files.catbox.moe/5zv26f.jpg'
        const res = await axios.get(imageUrl, { responseType: 'arraybuffer' })
        const img = await loadImage(res.data)
        const canvas = createCanvas(img.width, img.height)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)

        const paperX = img.width * 0.21
        const paperY = img.height * 0.60
        const paperW = img.width * 0.58
        const paperH = img.height * 0.17
        const padding = paperW * 0.08
        const textAreaW = paperW - padding * 2

        ctx.fillStyle = '#3b2f2f'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        function wrapLines(ctx, text, maxWidth) {
          const words = text.split(' ')
          let lines = []
          let line = ''
          for (let w of words) {
            const test = line + w + ' '
            if (ctx.measureText(test).width > maxWidth && line !== '') {
              lines.push(line.trim())
              line = w + ' '
            } else {
              line = test
            }
          }
          lines.push(line.trim())
          return lines
        }

        let fontSize = 450
        let lines = []

        while (fontSize > 32) {

          ctx.font = `${fontSize}px "SF Bold"`
          lines = wrapLines(ctx, text, textAreaW)
          const lineHeight = fontSize * 1.2
          if (lines.length <= 2 && lines.length * lineHeight <= paperH) break
          fontSize -= 2
        }

        ctx.font = `${fontSize}px "SF Bold"`

        const lineHeight = fontSize * 1.2
        const offsetY = paperH * 0.40
        const offsetX = paperW * -0.10
        const startY = paperY + (paperH / 2) - ((lines.length - 1) * lineHeight / 2) + offsetY

        const rotateDeg = -5
        const rotateRad = rotateDeg * Math.PI / 180

        lines.forEach((line, i) => {
          const x = (paperX + paperW / 2) - offsetX
          const y = startY + (i * lineHeight)
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(rotateRad)
          ctx.fillText(line, 0, 0)
          ctx.restore()
        })

        const buffer = canvas.toBuffer()

        const sticker = await createSticker(buffer, {
          pack: global.packname,
          author: global.author,
          type: StickerTypes.FULL,
          quality: 100
        })

        db.users[m.sender].limit -= biaya

        await alya.sendMessage(m.chat, { sticker })

      } catch (err) {
        console.log(err)
        reply('❌ Error saat membuat stiker')
      }
  }
}
