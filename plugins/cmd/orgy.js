// Plugin: orgy
// Commands: orgy
// Sumber: data/AlyaMedia/nsfw/orgy.json
// Akses: Premium only

'use strict'
const fs   = require('fs')
const path = require('path')

module.exports = {
  command: ['orgy'],
  tags: ['nsfw'],
  run: async (alya, m, ctx) => {
    const { isPrem, Ryuu, replyalya, replyprem } = ctx
    if (!isPrem && !Ryuu) return replyprem(global.mess?.only?.premium || '❌ Fitur ini khusus *Premium*!')

    await alya.sendMessage(m.chat, { react: { text: '🔞', key: m.key } })
    try {
      const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/AlyaMedia/nsfw/orgy.json'), 'utf8'))
      const pick = data[Math.floor(Math.random() * data.length)]
      const url  = typeof pick === 'string' ? pick : pick.url
      await alya.sendMessage(m.chat, { image: { url }, caption: global.mess?.success || '✅ Done!' }, { quoted: m })
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      replyalya('❌ Gagal mengambil konten orgy.')
    }
  }
}
