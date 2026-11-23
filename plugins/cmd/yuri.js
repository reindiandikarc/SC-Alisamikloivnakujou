// Plugin: yuri
// Commands: yuri, thighs → thighs dipindah ke nsfw-local, yuri tetap di sini
// Sumber: data/AlyaMedia/nsfw/yuri.json
// Akses: Premium only

'use strict'
const fs   = require('fs')
const path = require('path')

module.exports = {
  command: ['yuri'],
  tags: ['nsfw'],
  run: async (alya, m, ctx) => {
    const { isPrem, Ryuu, replyalya, replyprem } = ctx
    if (!isPrem && !Ryuu) return replyprem(global.mess?.only?.premium || '❌ Fitur ini khusus *Premium*!')

    await alya.sendMessage(m.chat, { react: { text: '🔞', key: m.key } })
    try {
      const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/AlyaMedia/nsfw/yuri.json'), 'utf8'))
      const pick = data[Math.floor(Math.random() * data.length)]
      await alya.sendMessage(m.chat, { image: { url: pick.url }, caption: global.mess?.success || '✅ Done!' }, { quoted: m })
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      replyalya('❌ Gagal mengambil konten yuri.')
    }
  }
}
