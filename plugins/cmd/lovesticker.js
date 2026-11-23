// Plugin: lovesticker
// Fixed V10→V19 migration - XeonMedia fetchJson
// Commands: lovesticker, dogesticker
// NOTE: lovestick (tanpa -er) ada di lovestick.js, ini alias-nya

'use strict'

module.exports = {
  command: ['lovesticker', 'dogesticker'],
  tags: ['sticker'],
  run: async (alya, m, ctx) => {
    const {
      command, from, replyalya
    } = ctx

    // dogesticker pakai endpoint doge, lovesticker pakai endpoint love
    const endpointMap = {
      lovesticker: 'love',
      dogesticker: 'doge'
    }
    const endpoint = endpointMap[command] || 'love'

    try {
      const ano = await fetchJson(`https://raw.githubusercontent.com/DGXeon/XeonMedia/main/${endpoint}`)
      const wifegerak = ano.trim().split('\n').filter(Boolean)
      if (!wifegerak.length) return replyalya('❌ Daftar gambar kosong.')
      const wifegerakx = wifegerak[Math.floor(Math.random() * wifegerak.length)]
      await alya.sendImageAsSticker(from, wifegerakx, m, {
        packname: global.packname || 'Alya',
        author: global.author || '@reindiandikarc'
      })
    } catch (e) {
      console.error('[lovesticker] Error:', e.message)
      replyalya(`❌ Gagal mengambil sticker ${command}.`)
    }
  }
}
