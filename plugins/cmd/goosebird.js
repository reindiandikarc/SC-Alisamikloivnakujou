// Plugin: goosebird
// Fixed V10→V19 migration - nekos.life API
// Commands: goosebird

'use strict'
const axios = require('axios')

module.exports = {
  command: ['goosebird'],
  tags: ['sticker'],
  run: async (alya, m, ctx) => {
    const {
      from, replyalya
    } = ctx

    try {
      const { data } = await axios.get('https://nekos.life/api/v2/img/goose')
      if (!data?.url) return replyalya('❌ Gagal mendapatkan gambar.')
      await alya.sendImageAsSticker(from, data.url, m, {
        packname: global.packname || 'Alya',
        author: global.author || '@reindiandikarc'
      })
    } catch (e) {
      console.error('[goosebird] Error:', e.message)
      replyalya('❌ Gagal mengambil sticker goose.')
    }
  }
}
