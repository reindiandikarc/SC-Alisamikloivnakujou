// Plugin: tickle
// Fixed V10→V19 migration - nekos.life API
// Commands: tickle

'use strict'
const axios = require('axios')

module.exports = {
  command: ['tickle'],
  tags: ['sticker'],
  run: async (alya, m, ctx) => {
    const {
      from, replyalya
    } = ctx

    try {
      const { data } = await axios.get('https://nekos.life/api/v2/img/tickle')
      if (!data?.url) return replyalya('❌ Gagal mendapatkan gambar.')
      await alya.sendImageAsSticker(from, data.url, m, {
        packname: global.packname || 'Alya',
        author: global.author || '@reindiandikarc'
      })
    } catch (e) {
      console.error('[tickle] Error:', e.message)
      replyalya('❌ Gagal mengambil sticker tickle.')
    }
  }
}
