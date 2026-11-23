// Plugin: fakewafat
// Auto-generated from Alya V12
// Commands: fakewafat

const path = require('path')

module.exports = {
  command: ["fakewafat"],
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

            if (!m.isGroup) return replyalya('❌ Fitur ini hanya dapat digunakan di dalam grup!')

            let biaya = 5
            let userAlt = global.db.users[m.sender]
            if (userAlt.limit < biaya) {
                return replyalya(`❌ Limit kamu tidak cukup!\n\n💳 Butuh: ${biaya}\n📊 Sisa Limit: ${userAlt.limit}`)
            }
            let q = m.quoted ? m.quoted : m
            let mime = (q.msg || q).mimetype || ''
            if (!/image/.test(mime)) {
                return replyalya(`📸 Kirim atau reply gambar dengan caption:\n${prefix + command} Nama|Lahir|Wafat`)
            }

            let inputText = text || m.caption || (m.quoted && m.quoted.caption) || ''
            if (!inputText.includes('|')) {
                return replyalya(`❌ Format salah!\n\nContoh:\n${prefix + command} Ryuu Tamvan|2002|2026`)
            }
            let [nama, lahir, wafat] = inputText.split('|').map(v => v.trim())
            if (!nama || !lahir || !wafat) return replyalya("❌ Pastikan semua data terisi: Nama|Lahir|Wafat")

            await alya.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

            const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas')
            const path = require('path')
            const fs = require('fs')

            const getbufer = async (url) => {
                const res = await fetch(url)
                return Buffer.from(await res.arrayBuffer())
            }

            const drawcircleimg = (ctx, img, x, y, size) => {
                ctx.save()
                ctx.beginPath()
                ctx.arc(x, y, size / 2, 0, Math.PI * 2)
                ctx.closePath()
                ctx.clip()
                ctx.imageSmoothingEnabled = true
                ctx.imageSmoothingQuality = 'high'
                ctx.drawImage(img, x - size / 2, y - size / 2, size, size)
                ctx.restore()
            }

            const fontPath = path.join(__dirname, './database/wafatfont.ttf')
            if (!fs.existsSync(fontPath)) {
                const res = await fetch('https://uploader.zenzxz.dpdns.org/uploads/1776849905914.ttf')
                fs.writeFileSync(fontPath, Buffer.from(await res.arrayBuffer()))
            }
            GlobalFonts.registerFromPath(fontPath, 'WafatFont')

            const bgurl = 'https://uploader.zenzxz.dpdns.org/uploads/1776848882042.jpeg'

            let media = await q.download()
            const bgBuffer = await getbufer(bgurl)

            const bg = await loadImage(bgBuffer)
            const personImg = await loadImage(media)

            const canvas = createCanvas(bg.width, bg.height)
            const ctx = canvas.getContext('2d')

            ctx.drawImage(bg, 0, 0, bg.width, bg.height)

            const centerX = bg.width / 2

            const fotoSize = 575
            drawcircleimg(ctx, personImg, centerX, 1210, fotoSize)

            ctx.fillStyle = '#462F29'
            ctx.textAlign = 'center'

            ctx.font = '60px WafatFont'
            ctx.fillText(nama, centerX, 1740)

            const rangeTahun = `${lahir} - ${wafat}`
            ctx.font = '40px WafatFont'
            ctx.fillText(rangeTahun, centerX, 1815)

            const buffer = canvas.toBuffer('image/png')
            userAlt.limit -= biaya

            await alya.sendMessage(m.chat, {
                image: buffer,
                caption: `🥀 *RIP ${nama.toUpperCase()}*\n\nSemoga amal ibadahnya diterima di sisi-Nya.\n\n💳 Limit terpakai: ${biaya}\n📊 Sisa limit: ${userAlt.limit}`
            }, { quoted: m })

        } catch (err) {
            console.error(err)
            replyalya('❌ Terjadi kesalahan saat memproses gambar wafat.')
        }
  }
}
