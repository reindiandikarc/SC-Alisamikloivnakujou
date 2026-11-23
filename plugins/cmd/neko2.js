// Plugin: neko2
// Commands: neko2
// Sumber: data/AlyaMedia/nsfw/neko2.json (local) / Pinterest fallback
// Akses: Premium only

'use strict'
const fs   = require('fs')
const path = require('path')

module.exports = {
  command: ['neko2'],
  tags: ['nsfw'],
  run: async (alya, m, ctx) => {
    const { isPrem, Ryuu, replyalya, replyprem } = ctx
    if (!isPrem && !Ryuu) return replyprem(global.mess?.only?.premium || '❌ Fitur ini khusus *Premium*!')

    await alya.sendMessage(m.chat, { react: { text: '🔞', key: m.key } })
    try {
      const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/AlyaMedia/nsfw/neko2.json'), 'utf8'))
      const pick = data[Math.floor(Math.random() * data.length)]
      const url  = typeof pick === 'string' ? pick : pick.url
      await alya.sendMessage(m.chat, { image: { url }, caption: global.mess?.success || '✅ Done!' }, { quoted: m })
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
      // Fallback Pinterest
      try {
        const { searchPinterest } = require('../../lib/pinterestHelper')
        const imageUrl = await searchPinterest('anime neko girl kawaii')
        if (!imageUrl) throw new Error('Pinterest kosong')
        await alya.sendMessage(m.chat, { image: { url: imageUrl }, caption: global.mess?.success || '✅ Done!' }, { quoted: m })
        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
      } catch {
        await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        replyalya('❌ Gagal mengambil konten neko2.')
      }
    }
  }
}
