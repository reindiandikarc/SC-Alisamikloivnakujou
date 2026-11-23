// Plugin: animespank
// Alya V20 — Anime Spank GIF
// Commands: animespank
// API: nekos.life img/spank → fallback waifu.pics nsfw/spank
// Akses: Premium only

'use strict'
const axios = require('axios')

module.exports = {
  command: ['animespank'],
  tags: ['nsfw'],
  run: async (alya, m, ctx) => {
    const { isPrem, Ryuu, replyalya, replyprem } = ctx
    if (!isPrem && !Ryuu) return replyprem(global.mess?.only?.premium || '❌ Fitur ini khusus *Premium*!')

    await alya.sendMessage(m.chat, { react: { text: '👋', key: m.key } })

    // Primary: nekos.life
    try {
      const res = await axios.get('https://nekos.life/api/v2/img/spank', { timeout: 10000 })
      const url = res.data?.url
      if (!url) throw new Error('URL tidak ditemukan dari nekos.life')
      await alya.sendMessage(m.chat, { image: { url }, caption: global.mess?.success || '✅ Done!' }, { quoted: m })
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
      return
    } catch (e) {
      console.warn('[animespank] nekos.life gagal, coba fallback...', e.message)
    }

    // Fallback: waifu.pics nsfw/spank
    try {
      const res = await axios.get('https://api.waifu.pics/nsfw/spank', { timeout: 10000 })
      const url = res.data?.url
      if (!url) throw new Error('URL tidak ditemukan dari waifu.pics')
      await alya.sendMessage(m.chat, { image: { url }, caption: global.mess?.success || '✅ Done!' }, { quoted: m })
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
      console.error('[animespank] semua sumber gagal:', e.message)
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      replyalya('❌ Gagal mengambil konten animespank. Coba beberapa saat lagi.')
    }
  }
}
