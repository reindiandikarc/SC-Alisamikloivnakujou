// Plugin: patricksticker
// Fixed V10→V19 migration - XeonMedia fetchJson
// Commands: patricksticker, patrick

'use strict'

module.exports = {
  command: ['patricksticker', 'patrick'],
  tags: ['sticker'],
  run: async (alya, m, ctx) => {
    const {
      from, replyalya
    } = ctx

    try {
      const ano = await fetchJson('https://raw.githubusercontent.com/DGXeon/XeonMedia/main/patrick')
      const wifegerak = ano.trim().split('\n').filter(Boolean)
      if (!wifegerak.length) return replyalya('❌ Daftar gambar kosong.')
      const wifegerakx = wifegerak[Math.floor(Math.random() * wifegerak.length)]
      await alya.sendImageAsSticker(from, wifegerakx, m, {
        packname: global.packname || 'Alya',
        author: global.author || '@reindiandikarc'
      })
    } catch (e) {
      console.error('[patricksticker] Error:', e.message)
      replyalya('❌ Gagal mengambil sticker patrick.')
    }
  }
}
