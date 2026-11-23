// Plugin: fakedev
// Auto-generated from Alya V12
// Commands: fakedev

const path = require('path')

module.exports = {
  command: ["fakedev"],
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

      const { createCanvas, loadImage, registerFont } = require('canvas')
      const axios = require('axios')

      registerFont('./data/assets/FontsFree-Net-SFProDisplay-Bold.ttf', { family: 'SF Bold' })

      try {
        if (!text) {
          return replyalya(`❌ Contoh penggunaan:\n${prefix + command} Reindiandikarc`)
        }

        await alya.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

        let user = m.quoted ? m.quoted.sender : m.sender

        const loadImageSafe = async (url) => {
          try {
            const res = await axios.get(url, {
              responseType: 'arraybuffer',
              timeout: 10000
            })
            return await loadImage(res.data)
          } catch {
            return null
          }
        }

        let inputImage = null
        if (m.quoted && /image/.test(m.quoted.mimetype)) {
          try {
            const buffer = await m.quoted.download()
            inputImage = await loadImage(buffer)
          } catch {}
        }

        let pp = null
        try {
          pp = await alya.profilePictureUrl(user, 'image')
        } catch {}

        const bgUrl = 'https://c.termai.cc/i189/mfJahyH.jpg'
        const crownUrl = 'https://files.catbox.moe/ionw8n.png'

        const defaultAvatar = 'https://telegra.ph/file/6880771a42bad09dd6087.jpg'
        const defaultBg = 'https://telegra.ph/file/24fa902ead26340f3df2c.jpg'
        const defaultCrown = 'https://telegra.ph/file/2c0d2a0c1f6e6a2b1c3b4.png'

        let bg = await loadImageSafe(bgUrl) || await loadImageSafe(defaultBg)
        let avatar = inputImage || await loadImageSafe(pp) || await loadImageSafe(defaultAvatar)
        let crown = await loadImageSafe(crownUrl) || await loadImageSafe(defaultCrown)

        const canvas = createCanvas(800, 800)
        const ctx = canvas.getContext('2d')

        if (bg) {
          ctx.drawImage(bg, 0, 0, 800, 800)
        } else {
          ctx.fillStyle = "#000"
          ctx.fillRect(0, 0, 800, 800)
        }

        const centerX = 400
        const centerY = 360
        const radius = 180

        ctx.beginPath()
        ctx.arc(centerX, centerY, radius + 25, 0, Math.PI * 2)
        ctx.fillStyle = 'black'
        ctx.fill()

        if (avatar) {
          ctx.save()
          ctx.beginPath()
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
          ctx.clip()

          ctx.drawImage(
            avatar,
            centerX - radius,
            centerY - radius,
            radius * 2,
            radius * 2
          )
          ctx.restore()
        }

        ctx.beginPath()
        ctx.arc(centerX, centerY, radius + 5, 0, Math.PI * 2)
        ctx.lineWidth = 6
        ctx.strokeStyle = 'white'
        ctx.stroke()

        if (crown) {
          ctx.save()
          ctx.translate(centerX + 90, centerY - radius - 20)
          ctx.rotate(0.3)
          ctx.drawImage(crown, -70, -70, 140, 110)
          ctx.restore()
        }

        const curvedText = text.toUpperCase()
        const chars = curvedText.split('')
        const len = chars.length

        ctx.font = 'bold 45px "SF Bold"'
        ctx.fillStyle = 'white'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'

        const textRadius = radius + 55

        const maxArc = Math.PI * 0.7
        const dynamicArc = Math.min(maxArc, len * 0.18)

        const startAngle = Math.PI / 2 + dynamicArc / 2
        const endAngle = Math.PI / 2 - dynamicArc / 2

        for (let i = 0; i < len; i++) {
          const t = i / (len - 1 || 1)
          const angle = startAngle + (endAngle - startAngle) * t

          const x = centerX + Math.cos(angle) * textRadius
          const y = centerY + Math.sin(angle) * textRadius

          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(angle - Math.PI / 2)
          ctx.fillText(chars[i], 0, 0)
          ctx.restore()
        }

        let buffer = canvas.toBuffer('image/png')

        await alya.sendMessage(m.chat, {
          image: buffer,
          caption: `🔥 Fakedev berhasil dibuat\n\n👤 Req by: @${user.split("@")[0]}`,
          mentions: [user]
        }, { quoted: m })

        await alya.sendMessage(m.chat, { react: { text: "✅", key: m.key } })

      } catch (e) {
        console.log(e)
        await alya.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
        replyalya('❌ Error bang 😅')
      }
  }
}
