// Plugin: mangasearch
// Commands: mangasearch
// Sumber: KlikMangaSearch dari dhn-api (sudah di-require di alya.js global)
// Akses: Premium only

'use strict'

module.exports = {
  command: ['mangasearch'],
  tags: ['nsfw'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, isPrem, Ryuu, replyalya, replyprem } = ctx
    if (!isPrem && !Ryuu) return replyprem(global.mess?.only?.premium || '❌ Fitur ini khusus *Premium*!')
    if (!text) return replyalya(`Mau cari manga apa?\nContoh: ${prefix + command} naruto`)

    await alya.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })
    try {
      const { KlikMangaSearch } = require('dhn-api')
      const data = await KlikMangaSearch(text)
      if (!data || !data.length) return replyalya('❌ Tidak ada hasil ditemukan.')

      const resultMessage = data.map(manga =>
        `🎬 *Judul:* ${manga.manga_name}\n` +
        `⭐ *Genre:* ${manga.manga_genre}\n` +
        `📖 *Deskripsi:* ${manga.manga_desc}\n` +
        `🔗 *URL:* ${manga.manga_url}`
      ).join('\n\n')

      const thumb = data[0]?.manga_thumb
      const imgUrl = Array.isArray(thumb) ? thumb[0] : thumb

      if (imgUrl) {
        await alya.sendMessage(m.chat, {
          image: { url: imgUrl },
          caption: `🌟 *Hasil Pencarian Manga*\n\n${resultMessage}`
        }, { quoted: m })
      } else {
        replyalya(`🌟 *Hasil Pencarian Manga*\n\n${resultMessage}`)
      }
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      replyalya(`❌ Gagal mencari manga.\n_${e.message}_`)
    }
  }
}
