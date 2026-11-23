// Plugin: woof
// Fixed V10→V19 migration - nekos.life API
// Commands: woof

'use strict'
const axios = require('axios')

module.exports = {
  command: ['woof'],
  tags: ['sticker'],
  run: async (alya, m, ctx) => {
    const {
      command, from, reply, replyalya
    } = ctx

    try {
      const { data } = await axios.get(`https://nekos.life/api/v2/img/${command}`)
      if (!data?.url) return replyalya('❌ Gagal mendapatkan gambar.')
      await alya.sendImageAsSticker(from, data.url, m, {
        packname: global.packname || 'Alya',
        author: global.author || '@reindiandikarc'
      })
    } catch (e) {
      console.error('[woof] Error:', e.message)
      replyalya('❌ Gagal mengambil sticker woof.')
    }
  }
}
