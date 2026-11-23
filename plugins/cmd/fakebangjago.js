// Plugin: fakebangjago
// Auto-generated from Alya V12
// Commands: fakebangjago

const path = require('path')

module.exports = {
  command: ["fakebangjago"],
  tags: ['admin'],
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

        const COST = 5

        if (!text || !text.includes(',')) {
            return replyalya(`❌ *Format salah!*

    Contoh:
    ${prefix + command} Ryuu, 1000000`)
        }

        if (!global.db.users[m.sender]) global.db.users[m.sender] = { limit: 0 }

        let limitUser = global.db.users[m.sender].limit

        if (limitUser < COST) {
            return replyalya(`❌ Limit kamu tidak cukup!

    💳 Limit dibutuhkan : ${COST}
    📊 Limit kamu : ${limitUser}`)
        }

        await alya.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

        const fs = require('fs')
        const path = require('path')
        const axios = require('axios')

        let skia
        try {
            skia = require('skia-canvas')
        } catch (e) {
            return replyalya('❌ Module *skia-canvas* belum terinstall!\n\nKetik di panel:\n```npm install skia-canvas```')
        }

        const { Canvas, loadImage, FontLibrary } = skia

        async function ensureFile(url, file) {
            const dir = path.dirname(file)
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

            if (!fs.existsSync(file)) {
                const res = await axios.get(url, { responseType: 'arraybuffer' })
                fs.writeFileSync(file, res.data)
            }
        }

        async function generateImage(saldo, greet) {
            const bgUrl = "https://raw.githubusercontent.com/uploader762/dat2/main/uploads/52e39f-1773064858080.jpg"
            const fontUrl = "https://raw.githubusercontent.com/uploader762/dat2/main/uploads/49bbd8-1773045557233.otf"
            const font2Url = "https://raw.githubusercontent.com/uploader762/dat1/main/uploads/203827-1773063086445.ttf"

            const font1 = "./media/fonts/ceraroundpro-medium.otf"
            const font2 = "./media/fonts/Roboto_Medium.ttf"

            await ensureFile(fontUrl, font1)
            await ensureFile(font2Url, font2)

            FontLibrary.use("CustomFont", font1)
            FontLibrary.use("GreetingFont", font2)

            const bgRes = await axios.get(bgUrl, { responseType: 'arraybuffer' })
            const bg = await loadImage(bgRes.data)

            const canvas = new Canvas(bg.width, bg.height)
            const ctx = canvas.getContext("2d")

            ctx.drawImage(bg, 0, 0, bg.width, bg.height)

            ctx.font = "125px CustomFont"
            ctx.fillStyle = "black"

            const numberWidth = ctx.measureText(saldo).width
            const numberX = 2470 - numberWidth

            ctx.fillText(saldo, numberX, 894)

            const rpWidth = ctx.measureText("Rp").width
            const rpX = numberX - rpWidth - 4

            ctx.fillText("Rp", rpX, 894)

            ctx.font = "93px GreetingFont"
            ctx.fillStyle = "gray"
            ctx.fillText(greet, 98, 86)

            return await canvas.toBuffer("image/png")
        }

        try {
            const args = text.split(',')
            const nama = args[0].trim()
            const saldoRaw = args[1].trim()

            const saldo = Number(saldoRaw.replace(/[^0-9]/g, ''))
                .toLocaleString('id-ID')

            const moment = require('moment-timezone')
            const h = parseInt(moment.tz('Asia/Jakarta').format('HH'))

            let waktu = 'Malam'
            if (h >= 4 && h < 11) waktu = 'Pagi'
            else if (h >= 11 && h < 15) waktu = 'Siang'
            else if (h >= 15 && h < 18) waktu = 'Sore'

            const buffer = await generateImage(
                saldo,
                `Selamat ${waktu}, ${nama}`
            )
            global.db.users[m.sender].limit -= COST
            let sisa = global.db.users[m.sender].limit

            await alya.sendMessage(m.chat, {
                image: buffer,
                caption: `🎨 *Fake Saldo bank Jago Berhasil Dibuat!*

    💳 Biaya Limit: -${COST}
    📊 Sisa Limitmu: ${sisa}`
            }, { quoted: m })

            await alya.sendMessage(m.chat, {
                react: { text: "✅", key: m.key }
            })

        } catch (err) {
            console.error(err)

            await alya.sendMessage(m.chat, {
                react: { text: "❌", key: m.key }
            })

            replyalya('❌ Gagal membuat gambar.')
        }
    }
//     	case 'web2zip':
  }
