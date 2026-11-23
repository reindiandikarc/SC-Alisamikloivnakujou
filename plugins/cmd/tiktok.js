// Plugin: tiktok
// Commands: tt, tiktok
// FIX: button → .ttaudio, teks caption sesuai permintaan

const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')
const path = require('path')

module.exports = {
  command: ["tt", "tiktok"],
  tags: ['downloader'],
  run: async (alya, m, ctx) => {
    const {
      command, text, prefix,
      replyalya, replytolak
    } = ctx

    const db = global.db
    const axios   = require('axios')
    const cheerio = require('cheerio')
    let urlTiktok = text || (m.quoted && m.quoted.text)

    if (!urlTiktok || !/tiktok\.com/g.test(urlTiktok)) {
      await alya.sendMessage(m.chat, { react: { text: '🙄', key: m.key } })
      return replyalya(`Haaah?! Link-nya mana? Jangan bikin aku bingung deh! 😤\n\n📌 Contoh: ${prefix + command} https://vt.tiktok.com/...`)
    }

    let biaya = 3
    if (db.users[m.sender].limit < biaya) {
      return replyalya(`Duh, miskin banget sih! Limit kamu nggak cukup buat ini. 😒\n\n💡 Butuh ${biaya} limit, sana cari dulu!`)
    }

    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    try {
      let apiData = {}
      try {
        const api = await axios.get(`https://api.nexray.web.id/downloader/tiktok?url=${encodeURIComponent(urlTiktok)}`)
        if (api.data?.status) apiData = api.data.result
      } catch (e) { console.log('[tiktok] NexRay error:', e.message) }

      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Origin': 'https://savett.cc',
        'Referer': 'https://savett.cc/en1/download',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10)'
      }

      const page   = await axios.get('https://savett.cc/en1/download')
      const csrf   = page.data.match(/name="csrf_token" value="([^"]+)"/)?.[1]
      const cookie = page.headers['set-cookie']?.map(v => v.split(';')[0]).join('; ')

      const post = await axios.post(
        'https://savett.cc/en1/download',
        `csrf_token=${encodeURIComponent(csrf)}&url=${encodeURIComponent(urlTiktok)}`,
        { headers: { ...headers, Cookie: cookie } }
      )

      const $ = cheerio.load(post.data)
      const statsRaw = []
      $('#video-info .my-1 span').each((_, el) => statsRaw.push($(el).text().trim()))

      let result = {
        username: apiData?.author?.fullname || $('#video-info h3').first().text().trim() || 'Unknown',
        desc:     apiData?.title || 'Gak ada caption-nya',
        duration: apiData?.duration || $('#video-info p.text-muted').first().text().replace(/Duration:/i, '').trim() || '?',
        views:    apiData?.stats?.views   || statsRaw[0] || '0',
        likes:    apiData?.stats?.likes   || statsRaw[1] || '0',
        comments: apiData?.stats?.comment || statsRaw[3] || '0',
        shares:   apiData?.stats?.share   || statsRaw[4] || '0',
        type:     null,
        mp4:      { nowm: [], wm: [] },
        mp3:      apiData?.music_info?.url ? [apiData.music_info.url] : [],
        slides:   []
      }

      const slides = $('.carousel-item[data-data]')
      if (slides.length) {
        result.type = 'photo'
        slides.each((_, el) => {
          try {
            const json = JSON.parse($(el).attr('data-data').replace(/&quot;/g, '"'))
            if (json.URL) json.URL.forEach(u => result.slides.push(u))
          } catch {}
        })
      } else {
        result.type = 'video'
        $('#formatselect option').each((_, el) => {
          const label = $(el).text().toLowerCase()
          const raw   = $(el).attr('value')
          if (!raw) return
          try {
            const json = JSON.parse(raw.replace(/&quot;/g, '"'))
            if (label.includes('mp4') && !label.includes('watermark')) result.mp4.nowm.push(...json.URL)
            if (label.includes('watermark')) result.mp4.wm.push(...json.URL)
            if (label.includes('mp3')) result.mp3.push(...json.URL)
          } catch {}
        })
      }

      db.users[m.sender].limit -= biaya
      const sisa = db.users[m.sender].limit

      // ── PHOTO SLIDE ──
      if (result.type === 'photo' && result.slides.length) {
        let cards = await Promise.all(
          result.slides.map(async (img, i) => ({
            header: proto.Message.InteractiveMessage.Header.create({
              ...(await prepareWAMessageMedia({ image: { url: img } }, { upload: alya.waUploadToServer })),
              title: '', subtitle: `Foto ${i + 1}/${result.slides.length}`, hasMediaAttachment: false
            }),
            body: { text: '' },
            nativeFlowMessage: { buttons: [] }
          }))
        )

        let msg = generateWAMessageFromContent(m.chat, {
          viewOnceMessage: {
            message: {
              interactiveMessage: {
                body: {
                  text: `📸 *Tiktok Photo (Slide)*\n\nNih, fotonya udah aku ambilin. Seneng kan? 🙄\n\n👤 Author: *${result.username}*\n❤️ Like: ${result.likes}\n💬 Komen: ${result.comments}\n\n📝 Cap: ${result.desc}\n\n━━━━━━━━━━━━━━━\n💸 Pajak: ${biaya} Limit\n📊 Sisa: ${sisa} (Hemat-hemat ya!)`
                },
                carouselMessage: { cards, messageVersion: 1 }
              }
            }
          }
        }, { quoted: m })

        await alya.sendMessage(m.chat, { react: { text: '💖', key: m.key } })
        return alya.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
      }

      // ── VIDEO ──
      const videoUrl = apiData?.data || result.mp4.nowm[0] || result.mp4.wm[0]
      if (!videoUrl) throw 'Yah, videonya gak ketemu.'

      // Caption sesuai permintaan
      const captionVideo =
        `🎥 *Tiktok Video (Auto)*\n\n` +
        `Abis liat link langsung aku duniain nih. Bukan karena aku mau ya, cuma kebetulan lagi luang aja! 🙄\n\n` +
        `👤 User : *${result.username}*\n` +
        `⏱ Durasi : ${result.duration}\n` +
        `❤️ Like : ${result.likes}\n\n` +
        `📝 ${result.desc}\n\n` +
        `━━━━━━━━━━━━━━━\n` +
        `💸 Pajak : ${biaya} Limit\n` +
        `📊 Sisa : ${sisa}`

      await alya.sendMessage(m.chat, {
        video: { url: videoUrl },
        caption: captionVideo,
        footer: 'Jangan panggil-panggil terus ya! 🙄',
        // Button arahkan ke .ttaudio
        buttons: result.mp3.length ? [
          {
            buttonId: `${prefix}ttaudio ${urlTiktok}`,
            buttonText: { displayText: '🎵 Download Audio MP3' },
            type: 1
          }
        ] : [],
        headerType: 4
      }, { quoted: m })

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (err) {
      console.error('[tiktok]', err)
      await alya.sendMessage(m.chat, { react: { text: '💢', key: m.key } })
      replyalya('Duh, error! Gara-gara kamu sih kasih link aneh-aneh. Coba lagi nanti deh! 😤')
    }
  }
}
