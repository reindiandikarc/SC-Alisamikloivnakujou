// Plugin: bratbahlil
// Auto-generated from Alya V12
// Commands: bratbahlil

const path = require('path')

module.exports = {
  command: ["bratbahlil"],
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
        if (!text) {
            return reply(`✨ Contoh:\n${prefix + command} halo member`)
        }

        let biaya = 1
        if (db.users[m.sender].limit < biaya) {
            return replyalya(`❌ Limit kamu tidak cukup!\n\n💡 Limit dibutuhkan: ${biaya}`)
        }

        await alya.sendMessage(m.chat,{ react: { text: "⏳", key: m.key }})

        try {
            const { createCanvas, loadImage } = require('canvas')
            const fetch = require('node-fetch')
            const { createSticker, StickerTypes } = require('wa-sticker-formatter')

            const imageUrl = 'https://i.ibb.co/JwT2QFvY/elaina-md.jpg'

            const res = await fetch(imageUrl)
            const buffer = Buffer.from(await res.arrayBuffer())
            const img = await loadImage(buffer)

            const canvas = createCanvas(img.width, img.height)
            const ctx = canvas.getContext('2d')

            ctx.drawImage(img, 0, 0, img.width, img.height)

            const boardX = img.width * 0.18
            const boardY = img.height * 0.55
            const boardW = img.width * 0.64
            const boardH = img.height * 0.30

            const padding = boardW * 0.08
            const textAreaW = boardW - padding * 2

            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = '#000000'

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

            let fontSize = 80
            let lines = []

            while (fontSize > 32) {
                ctx.font = `500 ${fontSize}px Roboto`
                lines = wrapLines(ctx, text, textAreaW)

                const lineHeight = fontSize * 1.05
                if (lines.length <= 3 && lines.length * lineHeight <= boardH) break
                fontSize--
            }

            ctx.font = `500 ${fontSize}px Roboto`
            const lineHeight = fontSize * 1.05

            const startY =
                boardY +
                boardH / 2 -
                (lines.length * lineHeight) / 2 +
                lineHeight * 0.38

            lines.slice(0, 3).forEach((line, i) => {
                ctx.fillText(
                    line,
                    boardX + boardW / 2,
                    startY + i * lineHeight
                )
            })

            const stickerBuffer = await createSticker(canvas.toBuffer('image/png'), {
                type: StickerTypes.FULL,
                pack: 'ALYA CHAN',
                author: 'Reindiandikarc',
                quality: 80
            })

            await alya.sendMessage(m.chat,{ sticker: stickerBuffer },{ quoted: m })

            db.users[m.sender].limit -= biaya

            await alya.sendMessage(m.chat,{ react: { text: "✅", key: m.key }})

        } catch (e) {
            console.error(e)
            reply('❌ Gagal membuat stiker brat bahlil')
        }
  }
}
