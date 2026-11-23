// Plugin: 8ballpool
// Fixed V10→V19 migration - nekos.life API
// Commands: 8ballpool

'use strict'
const axios = require('axios')

module.exports = {
  command: ['8ballpool'],
  tags: ['sticker'],
  run: async (alya, m, ctx) => {
    const {
      from, replyalya
    } = ctx

    try {
      const { data } = await axios.get('https://nekos.life/api/v2/img/8ball')
      if (!data?.url) return replyalya('❌ Gagal mendapatkan gambar.')
      await alya.sendImageAsSticker(from, data.url, m, {
        packname: global.packname || 'Alya',
        author: global.author || '@reindiandikarc'
      })
    } catch (e) {
      console.error('[8ballpool] Error:', e.message)
      replyalya('❌ Gagal mengambil sticker 8ballpool.')
    }
  }
}
