// Plugin: lobbyff
// Auto-generated from Alya V12
// Commands: lobyff, lobbyff
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')

const path = require('path')

module.exports = {
  command: ["lobyff", "lobbyff"],
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

        const fs = require('fs')
        const { exec } = require('child_process')
        const fetch = require('node-fetch')

        if (!text || !text.includes('|')) {
            return replyalya(`🎮 *FREE FIRE LOBBY MAKER*

    Contoh:
    ${prefix + command} 1|Jagoan FF
    ${prefix + command} random|Jagoan FF

    Pilihan template: 1 - 22 atau ketik *random*`)
        }

        let [numStr, name] = text.split('|').map(v => v.trim())
        numStr = numStr.toLowerCase()

        const imageUrls = {
            1: 'https://cloud-fukushima.vercel.app/uploader/8fjhd6ftps.jpg',
            2: 'https://cloud-fukushima.vercel.app/uploader/oz8hb4ow75.jpg',
            3: 'https://cloud-fukushima.vercel.app/uploader/tvz1cie8df.jpg',
            4: 'https://cloud-fukushima.vercel.app/uploader/yo9sg4vmo3.jpg',
            5: 'https://i.ibb.co/twtSvQXv/image.jpg',
            6: 'https://i.ibb.co/n80Bc1wV/image.jpg',
            7: 'https://i.ibb.co/mCwmt019/image.jpg',
            8: 'https://i.ibb.co/JwG60TwF/image.jpg',
            9: 'https://i.ibb.co/zWNLw6bV/image.jpg',
            10: 'https://i.ibb.co/d4DvnHw6/image.jpg',
            11: 'https://i.ibb.co/hxMGbx9v/image.jpg',
            12: 'https://i.ibb.co/jvd5xfvK/image.jpg',
            13: 'https://i.ibb.co/KxTQ0r0x/image.jpg',
            14: 'https://i.ibb.co/rRyxvrJW/image.jpg',
            15: 'https://i.ibb.co/PG5jwG6S/image.jpg',
            16: 'https://i.ibb.co/MDdH7kjG/image.jpg',
            17: 'https://i.ibb.co/6cnHvL31/image.jpg',
            18: 'https://i.ibb.co/dwg4CGdf/image.jpg',
            19: 'https://i.ibb.co/pvx1PZyW/image.jpg',
            20: 'https://i.ibb.co/kVkbxhwg/image.jpg',
            21: 'https://i.ibb.co/rK8ZTPbt/image.jpg',
            22: 'https://i.ibb.co/vC3p8NjP/image.jpg'
        }

        const max = Object.keys(imageUrls).length
        let num

        if (numStr === 'random') {
            num = Math.floor(Math.random() * max) + 1
        } else {
            num = parseInt(numStr)
            if (isNaN(num) || num < 1 || num > max) {
                return replyalya(`❌ Template tidak valid!\nPilih 1 - ${max} atau random`)
            }
        }

        await alya.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

        try {
            const imgUrl = imageUrls[num]
            const temp = `./temp_${Date.now()}.jpg`
            const out = `./out_${Date.now()}.jpg`
            const font = './lib/AGENCYB.TTF'

            if (!fs.existsSync(font)) {
                await alya.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
                return replyalya('❌ Font AGENCYB.TTF tidak ditemukan di folder /lib')
            }

            const res = await fetch(imgUrl)
            const buff = await res.buffer()
            fs.writeFileSync(temp, buff)

            let fontSize
            if (name.length <= 6) fontSize = 'w*0.055'
            else if (name.length <= 10) fontSize = 'w*0.045'
            else if (name.length <= 15) fontSize = 'w*0.038'
            else fontSize = 'w*0.030'

            const safeText = name.replace(/'/g, "\\'")
            const safeFont = font.replace(/\\/g, '/')

            const cmd = `ffmpeg -i "${temp}" -vf "drawtext=fontfile='${safeFont}':text='${safeText}':x=(w-text_w)/2:y=h*0.80-(text_h/2):fontsize=${fontSize}:fontcolor=yellow:shadowcolor=black:shadowx=3:shadowy=3" "${out}"`

            exec(cmd, async (err) => {
                if (err) {
                    console.error(err)
                    if (fs.existsSync(temp)) fs.unlinkSync(temp)
                    await alya.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
                    return replyalya('❌ FFMPEG error! Pastikan sudah terinstall.')
                }

                await alya.sendMessage(m.chat, {
                    image: fs.readFileSync(out),
                    caption: `🎮 *FREE FIRE LOBBY*

    👤 Name : ${name.toUpperCase()}
    🖼️ Template : ${num}`
                }, { quoted: m })

                if (fs.existsSync(temp)) fs.unlinkSync(temp)
                if (fs.existsSync(out)) fs.unlinkSync(out)

                await alya.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
            })

        } catch (e) {
            console.error(e)
            await alya.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
            replyalya('❌ Terjadi error saat proses gambar!')
        }
  }
}
