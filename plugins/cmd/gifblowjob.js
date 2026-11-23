// Plugin: gifblowjob
// Commands: gifblowjob
// API: waifu.pics nsfw gif/blowjob
// Akses: Premium only

'use strict'
const axios = require('axios')

module.exports = {
  command: ['gifblowjob'],
  tags: ['nsfw'],
  run: async (alya, m, ctx) => {
    const { isPrem, Ryuu, replyalya, replyprem } = ctx
    if (!isPrem && !Ryuu) return replyprem(global.mess?.only?.premium || '❌ Fitur ini khusus *Premium*!')

    await alya.sendMessage(m.chat, { react: { text: '🔞', key: m.key } })
    try {
      const res = await axios.get('https://api.waifu.pics/nsfw/blowjob', { timeout: 10000 })
      const url = res.data?.url
      if (!url) throw new Error('URL tidak ditemukan')
      await alya.sendMessage(m.chat, { video: { url }, gifPlayback: true, caption: global.mess?.success || '✅ Done!' }, { quoted: m })
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      replyalya('❌ Gagal mengambil gif blowjob.')
    }
  }
}
