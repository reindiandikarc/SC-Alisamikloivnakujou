// Plugin: hentai
// Commands: hentai
// Sumber: e-hentai scrape + fallback local hentai.json
// Akses: Premium only

'use strict'
const axios   = require('axios')
const cheerio = require('cheerio')
const fs      = require('fs')
const path    = require('path')

module.exports = {
  command: ['hentai'],
  tags: ['nsfw'],
  run: async (alya, m, ctx) => {
    const { isPrem, Ryuu, replyalya, replyprem } = ctx
    if (!isPrem && !Ryuu) return replyprem(global.mess?.only?.premium || '❌ Fitur ini khusus *Premium*!')

    await alya.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

    try {
      // Coba e-hentai scrape
      const page = Math.floor(Math.random() * 50)
      const { data } = await axios.get(`https://e-hentai.org/tag/random?prev=${page}`, { timeout: 12000 })
      const $       = cheerio.load(data)
      const results = []
      $('.glthumb').each((i, el) => {
        const src = $(el).find('img').attr('data-src')
        if (src) results.push(src)
      })

      let url
      if (results.length) {
        url = results[Math.floor(Math.random() * results.length)]
      } else {
        // fallback local
        const local = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/AlyaMedia/nsfw/hentai.json'), 'utf8'))
        const pick  = local[Math.floor(Math.random() * local.length)]
        url = typeof pick === 'string' ? pick : pick.url
      }

      await alya.sendMessage(m.chat, { image: { url }, caption: global.mess?.success || '✅ Done!' }, { quoted: m })
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
      // fallback local on error
      try {
        const local = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/AlyaMedia/nsfw/hentai.json'), 'utf8'))
        const pick  = local[Math.floor(Math.random() * local.length)]
        const url   = typeof pick === 'string' ? pick : pick.url
        await alya.sendMessage(m.chat, { image: { url }, caption: global.mess?.success || '✅ Done!' }, { quoted: m })
        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
      } catch {
        await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        replyalya(`❌ Gagal mengambil konten hentai.`)
      }
    }
  }
}
