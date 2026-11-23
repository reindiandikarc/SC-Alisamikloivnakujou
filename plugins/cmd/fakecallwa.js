// Plugin: fakecallwa
// Auto-generated from Alya V12
// Commands: fakecall, fakecallwa

const path = require('path')

module.exports = {
  command: ["fakecall", "fakecallwa"],
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

        if (!text || !text.includes('|')) {
            return replyalya(`📞 *FAKE CALL MAKER*

    Contoh:
    ${prefix + command} Alya | 13:46

    *(Reply gambar untuk foto profil!)*`)
        }

        let quotedAlt = m.quoted ? m.quoted : m
        let mimeAlt = (quotedAlt.msg || quoted).mimetype || ''

        if (!/image/.test(mime)) {
            return replyalya('📸 Harap reply gambar untuk dijadikan foto profil!')
        }

        let [callName, callDuration] = text.split('|').map(v => v.trim())

        await alya.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

        const fs = require('fs')
        const axios = require('axios')
        const path = require('path')
        const FormData = require('form-data')

        let skia;
        try {
            skia = require('skia-canvas')
        } catch (e) {
            await alya.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
            return replyalya("❌ Module 'skia-canvas' belum terinstall!\n\nKetik di terminal:\nnpm install skia-canvas")
        }

        const { Canvas, loadImage, FontLibrary } = skia

        const fontDir = path.resolve(process.cwd(), 'lib')
        if (!fs.existsSync(fontDir)) fs.mkdirSync(fontDir, { recursive: true })

        const fontNamePath = path.join(fontDir, 'CallName.ttf')
        const fontDurPath = path.join(fontDir, 'CallDur.ttf')

        try {
            if (!fs.existsSync(fontNamePath)) {
                let f1 = await axios.get('https://raw.githubusercontent.com/bjirlahzee/data/main/uploads/350119.ttf', { responseType: 'arraybuffer' })
                fs.writeFileSync(fontNamePath, Buffer.from(f1.data))
            }
            if (!fs.existsSync(fontDurPath)) {
                let f2 = await axios.get('https://raw.githubusercontent.com/bjirlahzee/data/main/uploads/979d16.ttf', { responseType: 'arraybuffer' })
                fs.writeFileSync(fontDurPath, Buffer.from(f2.data))
            }

            FontLibrary.use('WACallName', fontNamePath)
            FontLibrary.use('WACallDur', fontDurPath)
        } catch (e) {
            return replyalya('❌ Gagal download font!')
        }

        let mediaPath = await alya.downloadAndSaveMediaMessage(quoted, 'fakecall')
        let avatarUrl = ''

        try {
            let form = new FormData()
            form.append('files[]', fs.createReadStream(mediaPath))

            let res = await axios.post('https://uguu.se/upload.php', form, {
                headers: { ...form.getHeaders() }
            })

            avatarUrl = res.data.files[0].url
        } catch {
            try {
                let form = new FormData()
                form.append('reqtype', 'fileupload')
                form.append('fileToUpload', fs.createReadStream(mediaPath))

                let res = await axios.post('https://catbox.moe/user/api.php', form, {
                    headers: { ...form.getHeaders() }
                })

                avatarUrl = res.data
            } catch {
                if (fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath)
                await alya.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
                return replyalya('❌ Upload gambar gagal!')
            }
        }

        if (fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath)

        try {
            const bgUrl = 'https://i.ibb.co/jknqK7nh/image.jpg'

            const bg = await loadImage(bgUrl)
            const avatar = await loadImage(avatarUrl)

            const canvas = new Canvas(1080, 2400)
            const ctx = canvas.getContext('2d')

            ctx.drawImage(bg, 0, 0, 1080, 2400)

            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'

            ctx.font = '48px WACallName'
            ctx.fillStyle = '#ffffff'
            ctx.fillText(callName, 540, 127)

            ctx.font = '32px WACallDur'
            ctx.fillStyle = '#b0b3b5'
            ctx.fillText(callDuration, 540, 205)

            const avaSize = 409
            const cX = 540
            const cY = 1201

            ctx.save()
            ctx.beginPath()
            ctx.arc(cX, cY, avaSize / 2, 0, Math.PI * 2)
            ctx.clip()
            ctx.drawImage(avatar, cX - avaSize / 2, cY - avaSize / 2, avaSize, avaSize)
            ctx.restore()

            const buffer = await canvas.png

            await alya.sendMessage(m.chat, {
                image: buffer,
                caption: `📲 *Fake Call Berhasil!*

    👤 Nama : ${callName}
    ⏱️ Durasi : ${callDuration}`
            }, { quoted: m })

            await alya.sendMessage(m.chat, { react: { text: "✅", key: m.key } })

        } catch (e) {
            console.error(e)
            await alya.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
            replyalya(`❌ Error render:\n${e.message}`)
        }
  }
}
