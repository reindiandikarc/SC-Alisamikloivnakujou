// Plugin: miku
// Pinterest powered - Hatsune Miku
// Commands: miku

module.exports = {
  command: ["miku"],
  tags: ['anime'],
  run: async (alya, m, ctx) => {
    const { reply, replyalya } = ctx
    const query = "Hatsune Miku vocaloid anime"
    await alya.sendMessage(m.chat, { react: { text: '🎵', key: m.key } })
    try {
      const { searchPinterest } = require('../../lib/pinterestHelper')
      const imageUrl = await searchPinterest(query)
      if (!imageUrl) return replyalya('❌ Gambar tidak ditemukan. Coba lagi.')
      await alya.sendMessage(m.chat, {
        image: { url: imageUrl },
        caption: `🎵 *Hatsune Miku*\n\n_Powered by Pinterest_`
      }, { quoted: m })
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
      console.error('[Pinterest Error]', e.message)
      replyalya('❌ Gagal mengambil gambar dari Pinterest.')
    }
  }
}
