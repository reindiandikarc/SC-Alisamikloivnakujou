// Plugin: xnxxdl
// Commands: xnxxdl
// Sumber: scrape/scraperr.js → xnxxdl()
// Akses: Premium only

'use strict'
const { xnxxdl } = require('../../scrape/scraperr')

module.exports = {
  command: ['xnxxdl'],
  tags: ['nsfw'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, isPrem, Ryuu, replyalya, replyprem } = ctx
    if (!isPrem && !Ryuu) return replyprem(global.mess?.only?.premium || '❌ Fitur ini khusus *Premium*!')
    if (!text) return replyalya(`Masukkan URL XNXX\nContoh: ${prefix + command} https://xnxx.com/video-xxxxx/...`)
    if (!text.includes('xnxx.com')) return replyalya('❌ Masukkan link XNXX yang valid!')

    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
    try {
      const xn = await xnxxdl(text)
      const r  = xn.result || xn
      const dl = r.files?.high || r.files?.low || r.files?.HLS
      if (!dl) throw new Error('URL download tidak ditemukan')

      await alya.sendMessage(m.chat, {
        video: { url: dl },
        caption:
          `≡  *XNXX DL*\n\n` +
          `▢ *📌 Judul*: ${r.title || '-'}\n` +
          `▢ *⌚ Durasi*: ${r.duration || '-'}\n` +
          `▢ *🎞️ Info*: ${r.info || '-'}`
      }, { quoted: m })
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      replyalya(`❌ Gagal download XNXX.\n_${e.message}_`)
    }
  }
}
