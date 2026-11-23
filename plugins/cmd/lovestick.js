// Plugin: lovestick
// Fixed V10→V19 migration - XeonMedia fetchJson
// Commands: lovestick, lovesticker

'use strict'

module.exports = {
  command: ['lovestick', 'lovesticker'],
  tags: ['sticker'],
  run: async (alya, m, ctx) => {
    const {
      from, replyalya
    } = ctx

    try {
      const ano = await fetchJson('https://raw.githubusercontent.com/DGXeon/XeonMedia/main/love')
      const wifegerak = ano.trim().split('\n').filter(Boolean)
      if (!wifegerak.length) return replyalya('❌ Daftar gambar kosong.')
      const wifegerakx = wifegerak[Math.floor(Math.random() * wifegerak.length)]
      await alya.sendImageAsSticker(from, wifegerakx, m, {
        packname: global.packname || 'Alya',
        author: global.author || '@reindiandikarc'
      })
    } catch (e) {
      console.error('[lovestick] Error:', e.message)
      replyalya('❌ Gagal mengambil sticker love.')
    }
  }
}
