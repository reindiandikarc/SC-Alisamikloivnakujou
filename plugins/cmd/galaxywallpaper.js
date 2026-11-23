// Plugin: galaxywallpaper
// Commands: galaxywallpaper, 1917style
// V20 FIX: pakai lib/ephoto.js

'use strict'

const { ephoto, getEphotoUrl } = require('../../lib/ephoto')

module.exports = {
  command: ['galaxywallpaper', '1917style'],
  tags: ['ephoto'],
  run: async (alya, m, ctx) => {
    const { command, q, prefix, reply, replyalya, mess } = ctx

    if (!q) return replyalya(`Example : ${prefix + command} alya`)
    alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } })

    try {
      const url = getEphotoUrl(command)
      const imgUrl = await ephoto(url, q)
      await alya.sendMessage(m.chat, { image: { url: imgUrl }, caption: mess.success }, { quoted: m })
    } catch (e) {
      console.error('[ephoto:galaxywallpaper]', e.message)
      reply(`❌ Gagal generate ephoto: ${e.message}`)
    }
  }
}
