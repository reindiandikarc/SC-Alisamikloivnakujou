// Plugin: searchsfx
// Commands: searchsfx, sfx
// Cari sound effect dari Myinstants.com
// V20 — by Alya

'use strict'

const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = require('@whiskeysockets/baileys')
const axios   = require('axios')
const cheerio = require('cheerio')

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

/**
 * Scrape hasil pencarian dari myinstants.com
 * @param {string} query
 * @returns {Array} list of { title, mp3Url, pageUrl }
 */
async function searchMyInstants(query) {
  const url = `https://www.myinstants.com/en/search/?name=${encodeURIComponent(query)}`
  const { data } = await axios.get(url, {
    headers: { 'User-Agent': UA },
    timeout: 15000
  })

  const $ = cheerio.load(data)
  const results = []

  $('.instant').each((i, el) => {
    if (results.length >= 8) return false

    const btn   = $(el).find('.small-button')
    const title = $(el).find('.instant-link').text().trim() ||
                  btn.attr('title') || btn.attr('alt') || `SFX ${i + 1}`

    // onclick="play('/media/sounds/xxx.mp3')" atau src langsung
    const onclickRaw = btn.attr('onclick') || ''
    const matchMp3   = onclickRaw.match(/play\('([^']+)'\)/)
    if (!matchMp3) return

    const mp3Path  = matchMp3[1]  // e.g. /media/sounds/bruh.mp3
    const mp3Url   = `https://www.myinstants.com${mp3Path}`
    const pageHref = $(el).find('.instant-link').attr('href') || ''
    const pageUrl  = pageHref ? `https://www.myinstants.com${pageHref}` : mp3Url

    results.push({ title, mp3Url, pageUrl })
  })

  return results
}

module.exports = {
  command: ['searchsfx', 'sfx'],
  tags: ['tools'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak } = ctx

    if (!q) {
      return replyalya(
        `╔══〔 🔊 *SEARCH SFX* 〕══╗\n` +
        `┃\n` +
        `┃  Cari sound effect dari\n` +
        `┃  *Myinstants.com* 🎵\n` +
        `┃\n` +
        `┃  Cara pakai:\n` +
        `┃  *${prefix + command} bruh*\n` +
        `┃  *${prefix + command} anime wow*\n` +
        `┃  *${prefix + command} vine boom*\n` +
        `┃\n` +
        `╚══════════════════════════╝`
      )
    }

    await alya.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

    let results
    try {
      results = await searchMyInstants(q)
    } catch (e) {
      console.error('[searchsfx]', e.message)
      return replyalya(`❌ Gagal scrape Myinstants: ${e.message}`)
    }

    if (!results || results.length === 0) {
      return replyalya(
        `😞 Tidak ditemukan SFX untuk *"${q}"*\n\n` +
        `Coba kata kunci lain, contoh:\n` +
        `• *${prefix + command} bruh*\n` +
        `• *${prefix + command} vineboom*\n` +
        `• *${prefix + command} among us*`
      )
    }

    // Kirim 1 preview dulu (langsung download + kirim audio)
    // Lalu kirim carousel sisanya sebagai list button

    // ── Carousel mode (seperti ytsearch) ──
    const slides = []

    for (const sfx of results) {
      slides.push({
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: `🔊 ${sfx.title}`,
          hasMediaAttachment: false
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [
            {
              name: 'quick_reply',
              buttonParamsJson: JSON.stringify({
                display_text: '⬇️ Download & Kirim',
                id: `${prefix}getsfx ${sfx.mp3Url}|${sfx.title}`
              })
            },
            {
              name: 'cta_copy',
              buttonParamsJson: JSON.stringify({
                display_text: '🔗 Salin Link MP3',
                copy_code: sfx.mp3Url
              })
            },
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: '🌐 Buka Halaman',
                url: sfx.pageUrl,
                merchant_url: sfx.pageUrl
              })
            }
          ]
        }),
        footer: proto.Message.InteractiveMessage.Footer.create({
          text: `🌐 myinstants.com`
        })
      })
    }

    const msg = await generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.fromObject({
                text:
                  `🔊 *Hasil Pencarian SFX*\n` +
                  `🔍 Kata kunci: *"${q}"*\n\n` +
                  `Ditemukan *${results.length}* sound effect\n` +
                  `Geser & tekan tombol untuk download! 👆`
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: '🎵 Sumber: Myinstants.com'
              }),
              carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                cards: slides
              })
            })
          }
        }
      },
      { quoted: m }
    )

    await alya.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  }
}
