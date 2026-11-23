// Plugin: trap
// Commands: trap
// API: waifu.pics nsfw/trap
// Akses: Premium only

'use strict'
const axios = require('axios')

module.exports = {
  command: ['trap'],
  tags: ['nsfw'],
  run: async (alya, m, ctx) => {
    const { isPrem, Ryuu, replyalya, replyprem } = ctx
    if (!isPrem && !Ryuu) return replyprem(global.mess?.only?.premium || '❌ Fitur ini khusus *Premium*!')

    await alya.sendMessage(m.chat, { react: { text: '🔞', key: m.key } })
    try {
      const res = await axios.get('https://waifu.pics/api/nsfw/trap', { timeout: 10000 })
      const url = res.data?.url
      if (!url) throw new Error('URL tidak ditemukan')
      await alya.sendMessage(m.chat, { image: { url }, caption: global.mess?.success || '✅ Done!' }, { quoted: m })
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      replyalya('❌ Gagal mengambil konten trap.')
    }
  }
}
