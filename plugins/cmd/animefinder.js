// Plugin: animefinder
// Alias for anime_detail/kusonime_search
// Commands: animefinder

const path = require('path')

module.exports = {
  command: ["animefinder"],
  tags: ['anime'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, replyalya } = ctx
    if (!text) return replyalya(`Contoh: *${prefix}${command} naruto*`)
    try {
      const anime_detail = require('./anime_detail')
      return anime_detail.run(alya, m, ctx)
    } catch(e) {
      replyalya('❌ Fitur anime finder sedang tidak tersedia.')
    }
  }
}
