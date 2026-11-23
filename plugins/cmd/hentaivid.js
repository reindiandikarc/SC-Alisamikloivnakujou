// Plugin: hentaivid
// Alya V20 — Hentai Video / GIF
// Commands: hentaivid, hentaivideo
// Sumber: waifu.pics nsfw gif endpoints (multi-endpoint fallback)
// Akses: Premium only

'use strict'
const axios = require('axios')

// Daftar endpoint gif nsfw dari waifu.pics yang diketahui aktif
const GIF_ENDPOINTS = ['blowjob', 'spank', 'neko']

module.exports = {
  command: ['hentaivid', 'hentaivideo'],
  tags: ['nsfw'],
  run: async (alya, m, ctx) => {
    const { isPrem, Ryuu, replyalya, replyprem } = ctx
    if (!isPrem && !Ryuu) return replyprem(global.mess?.only?.premium || '❌ Fitur ini khusus *Premium*!')

    await alya.sendMessage(m.chat, { react: { text: '🔞', key: m.key } })

    // Coba beberapa endpoint secara berurutan sampai ada yang berhasil
    for (const endpoint of GIF_ENDPOINTS) {
      try {
        const res = await axios.get(`https://api.waifu.pics/nsfw/${endpoint}`, { timeout: 10000 })
        const url = res.data?.url
        if (!url) continue

        await alya.sendMessage(m.chat, {
          video: { url },
          gifPlayback: true,
          caption: global.mess?.success || '✅ Done!'
        }, { quoted: m })

        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        return
      } catch (e) {
        console.warn(`[hentaivid] endpoint ${endpoint} gagal:`, e.message)
      }
    }

    // Semua endpoint gagal
    await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    replyalya('❌ Gagal mengambil konten hentai video. Semua sumber tidak tersedia, coba beberapa saat lagi.')
  }
}
