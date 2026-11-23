// Plugin: fakegc
// Auto-generated from Alya V12
// Commands: fakegc

const path = require('path')

module.exports = {
  command: ["fakegc"],
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

        try {
            if (!m.isGroup) return replytolak('❌ Khusus grup!')

            let biaya = 5
            let user = global.db.users[m.sender]

            if (user.limit < biaya) {
                return replyalya(`❌ Limitmu ga cukup!\n\n💳 Butuh: ${biaya}\n📊 Limit kamu: ${user.limit}`)
            }

            let q = m.quoted ? m.quoted : m
            let mime = (q.msg || q).mimetype || ''

            if (!/image/.test(mime)) {
                return replyalya(`📸 Kirim / reply gambar:\n\n${prefix + command} Nama Grup|Jumlah Anggota`)
            }

            let inputText = text || m.caption || (m.quoted && m.quoted.caption) || ''
            let [nama, jumlah] = inputText.split('|')

            if (!nama || !jumlah) {
                return replyalya(`❌ Format salah!\n\nContoh:\n${prefix + command} Alya x Reindiandikarc 😎|100`)
            }

            await alya.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

            const { createCanvas, loadImage, registerFont } = require('canvas')
            const twemoji = require('twemoji')

            registerFont('./data/assets/FontsFree-Net-SFProDisplay-Regular.ttf', { family: 'SF' })
            registerFont('./data/assets/FontsFree-Net-SFProDisplay-Bold.ttf', { family: 'SF Bold' })

            let media = await q.download()
            let template = await loadImage('https://files.catbox.moe/qvtp4f.png')
            let avatar = await loadImage(media) // Tidak perlu upload ke catbox!

            const canvas = createCanvas(template.width, template.height)
            const ctx = canvas.getContext('2d')

            ctx.drawImage(template, 0, 0)

            let centerX = template.width / 2
            let centerY = 300
            let radius = 120

            ctx.save()
            ctx.beginPath()
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
            ctx.closePath()
            ctx.clip()
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = 'high'
            ctx.drawImage(avatar, centerX - radius, centerY - radius, radius * 2, radius * 2)
            ctx.restore()

            ctx.shadowColor = "rgba(0,0,0,0.1)"
            ctx.shadowBlur = 5

            async function drawTextWithEmoji(ctx, text, y, size = 40, font = 'SF') {
                ctx.font = `${size}px "${font}"`
                const parsed = twemoji.parse(text, { folder: '72x72', ext: '.png' })
                let parts = parsed.split(/(<img[^>]+>)/g)

                let totalWidth = 0
                for (let part of parts) {
                    if (part.startsWith('<img')) {
                        totalWidth += size
                    } else {
                        totalWidth += ctx.measureText(part).width
                    }
                }

                let x = centerX - totalWidth / 2
                for (let part of parts) {
                    if (part.startsWith('<img')) {
                        let url = part.match(/src="([^"]+)"/)[1]
                        try {
                            let img = await loadImage(url)
                            ctx.drawImage(img, x, y - size + 8, size, size)
                        } catch (e) {}
                        x += size
                    } else {
                        ctx.fillText(part, x, y)
                        x += ctx.measureText(part).width
                    }
                }
            }

            ctx.fillStyle = '#ffffff'
            let words = nama.trim().split(' ')
            let lines = []
            let line = ''
            ctx.font = '58px "SF Bold"'

            for (let word of words) {
                let test = line + word + ' '
                if (ctx.measureText(test).width > 600) {
                    lines.push(line.trim())
                    line = word + ' '
                } else {
                    line = test
                }
            }
            lines.push(line.trim())

            let yStart = 480
            for (let i = 0; i < lines.length; i++) {
                await drawTextWithEmoji(ctx, lines[i], yStart + (i * 65), 58, 'SF Bold')
            }

            ctx.fillStyle = '#b0b0b0'
            let yAnggota = yStart + (lines.length * 60)
            await drawTextWithEmoji(ctx, `👥 Grup · ${jumlah.trim()} peserta`, yAnggota, 38, 'SF')

            let buffer = canvas.toBuffer()
            user.limit -= biaya

            await alya.sendMessage(m.chat, {
                image: buffer,
                caption: `📱 *iPhone Group Info*\n\n👥 ${nama}\n\n💳 Limit terpakai: ${biaya}\n📊 Sisa limit: ${user.limit}`
            }, { quoted: m })

        } catch (err) {
            console.error(err)
            replyalya('❌ Terjadi kesalahan teknis saat memproses gambar.')
        }
  }
}
