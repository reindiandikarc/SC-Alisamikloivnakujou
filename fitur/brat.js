// Plugin: brat
// Commands: bratgambar, bratimg, bratvid, bratvideo
// Fix bratvid: deteksi format buffer (webp/webm/mp4) sebelum kirim ke exif

const path = require('path')

module.exports = [
  {
    command: ["bratgambar", "bratimg"],
    tags: ['general'],
    run: async (alya, m, ctx) => {
      const {
        command, text, prefix,
        reply, replyalya, replytolak,
        setting, user
      } = ctx

      if (!text) return m.reply('⚠️ Teksnya mana?')
      let biaya = 1
      if (db.users[m.sender].limit < biaya) {
        return replyalya(`❌ Limit kamu tidak cukup!\n\n💡 Limit dibutuhkan: ${biaya}`)
      }
      await alya.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

      const axios = require('axios')
      const bratUrl = `https://brat.siputzx.my.id/image?text=${encodeURIComponent(text)}&background=%23ffffff&color=%23000000&emojiStyle=apple`

      let imageBuffer
      try {
        const response = await axios.get(bratUrl, { responseType: 'arraybuffer' })
        imageBuffer = Buffer.from(response.data, 'binary')
      } catch (err) {
        console.error(err)
        return replyalya("❌ Gagal mengambil gambar Brat.")
      }

      let hdBuffer
      try {
        try { hdBuffer = await hdr(imageBuffer, 4) } catch { hdBuffer = await hdr(imageBuffer, 2) }
      } catch (err) {
        console.error(err)
        return replyalya("❌ Gagal memproses gambar ke HD.")
      }

      try {
        await alya.sendImageAsSticker(m.chat, hdBuffer, m, { packname: global.packname })
        db.users[m.sender].limit -= biaya
        await alya.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
      } catch (err) {
        console.error(err)
        return replyalya("❌ Gagal mengirim stiker.")
      }
    }
  },

  {
    command: ["bratvid", "bratvideo"],
    tags: ['general'],
    run: async (alya, m, ctx) => {
      const {
        command, text, prefix,
        replyalya,
      } = ctx

      const inputText = (m.quoted ? m.quoted.text : text) || ''
      if (!inputText.trim()) {
        await alya.sendMessage(m.chat, { react: { text: '🙄', key: m.key } })
        return replyalya(
          `Haaah?! Teksnya mana?! 💢\n\n` +
          `📌 Contoh: *${prefix + command}* Halo sayang\n` +
          `📌 Dengan emoji: *${prefix + command}* Halo --emoji=whatsapp\n\n` +
          `🎨 Pilihan emoji: ios (default), whatsapp`
        )
      }

      let biaya = 5
      if (db.users[m.sender].limit < biaya) {
        return replyalya(`Duh, limit kamu nggak cukup! Butuh ${biaya} limit. Cari dulu sana, baka! 😒`)
      }

      await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

      try {
        const hd      = command.includes('hd')
        const rawText = inputText.split('--')[0].trim()
        const emojiOpt = inputText.split('--emoji=')?.[1]?.split('--')?.[0]?.trim() || 'ios'

        const token = Buffer.from(String(Date.now()))
          .toString('base64').split('')
          .map(c => c.charCodeAt(0).toString()).join('').substring(0, 20)

        // Deteksi format buffer via magic bytes
        const detectFormat = (buf) => {
          if (!Buffer.isBuffer(buf) || buf.length < 12) return 'unknown'
          const hex4 = buf.slice(0, 4).toString('hex')
          if (hex4 === '52494646' && buf.slice(8, 12).toString('ascii') === 'WEBP')
            return buf.indexOf(Buffer.from('ANIM')) !== -1 ? 'animated_webp' : 'static_webp'
          if (hex4 === '1a45dfa3') return 'webm'
          if (buf.slice(4, 8).toString('ascii') === 'ftyp') return 'mp4'
          return 'unknown'
        }

        const fetchValidBuffer = async (url) => {
          try {
            const buff = await getBuffer(url)
            if (!buff || !Buffer.isBuffer(buff) || buff.length < 500) return null
            return buff
          } catch { return null }
        }

        // Primary API → Fallback
        let buff = await fetchValidBuffer(
          `https://brat.termai.cc/animate?text=${encodeURIComponent(rawText)}&hd=${hd}&token=${token}&emojiType=${emojiOpt}`
        )
        if (!buff) buff = await fetchValidBuffer(
          `https://brat.siputzx.my.id/webm?text=${encodeURIComponent(rawText)}`
        )
        if (!buff) throw new Error('Semua API brat gagal atau return data kosong.')

        const fmt = detectFormat(buff)
        console.log(`[bratvid] size=${buff.length} format=${fmt}`)

        const { writeExifVid, videoToWebp } = require('../../lib/exif')
        let stickerBuff

        if (fmt === 'webm' || fmt === 'mp4') {
          // Format video normal → writeExifVid (lewat videoToWebp internal)
          stickerBuff = await writeExifVid(buff, {
            packname: global.packname || 'Alya Bot',
            author: m.pushName || global.author
          })

        } else if (fmt === 'animated_webp') {
          // Animated webp → inject EXIF langsung via node-webpmux tanpa re-encode
          const webpMux = require('node-webpmux')
          const os = require('os'), fs = require('fs'), crypto = require('crypto')
          const tmpIn  = path.join(os.tmpdir(), `${crypto.randomBytes(6).toString('hex')}.webp`)
          const tmpOut = path.join(os.tmpdir(), `${crypto.randomBytes(6).toString('hex')}.webp`)
          const img = new webpMux.Image()
          const json = {
            'sticker-pack-id': 'https://github.com/KirBotz',
            'sticker-pack-name': global.packname || 'Alya Bot',
            'sticker-pack-publisher': m.pushName || global.author || 'Alya',
            'emojis': ['']
          }
          const exifAttr = Buffer.from([0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,0x00,0x00,0x16,0x00,0x00,0x00])
          const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8')
          const exif = Buffer.concat([exifAttr, jsonBuff])
          exif.writeUIntLE(jsonBuff.length, 14, 4)
          fs.writeFileSync(tmpIn, buff)
          await img.load(tmpIn)
          fs.unlinkSync(tmpIn)
          img.exif = exif
          await img.save(tmpOut)
          stickerBuff = tmpOut

        } else {
          // Unknown format → fallback videoToWebp + exif
          console.warn(`[bratvid] Format unknown (${fmt}), fallback videoToWebp`)
          const webpBuff = await videoToWebp(buff)
          stickerBuff = await writeExifVid(webpBuff, {
            packname: global.packname || 'Alya Bot',
            author: m.pushName || global.author
          })
        }

        db.users[m.sender].limit -= biaya
        const sisa = db.users[m.sender].limit

        await alya.sendMessage(m.chat, { sticker: stickerBuff }, { quoted: m })
        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        replyalya(
          `✅ Brat sticker animated selesai!\n━━━━━━━━━━━━━━━\n💸 Limit terpakai : ${biaya}\n📊 Sisa limit : ${sisa}`
        )

      } catch (e) {
        console.error('[bratvid]', e)
        await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        replyalya('❌ *Gagal buat brat sticker!*\n\n_Coba lagi nanti ya 😤_')
      }
    }
  }
]
