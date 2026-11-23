// Plugin: xnxxsearch
// Commands: xnxxsearch
// Sumber: scrape/scraperr.js → xnxxsearch()
// Akses: Premium only

'use strict'
const { xnxxsearch } = require('../../scrape/scraperr')

module.exports = {
  command: ['xnxxsearch'],
  tags: ['nsfw'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, isPrem, Ryuu, replyalya, replyprem } = ctx
    if (!isPrem && !Ryuu) return replyprem(global.mess?.only?.premium || '❌ Fitur ini khusus *Premium*!')
    if (!text) return replyalya(`Masukkan query pencarian\nContoh: ${prefix + command} japanese`)

    await alya.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })
    try {
      const res = await xnxxsearch(text)
      const results = res.result || res
      if (!results || !results.length) return replyalya('❌ Tidak ada hasil ditemukan.')

      const ff = results.slice(0, 10).map((v, i) =>
        `${i + 1}┃ *Title*: ${v.title || '-'}\n*Link*: ${v.link || v.url || '-'}`
      ).join('\n\n')

      replyalya(ff)
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      replyalya(`❌ Gagal mencari XNXX.\n_${e.message}_`)
    }
  }
}
