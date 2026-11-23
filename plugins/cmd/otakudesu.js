// Plugin: otakudesu
// Anime search using kusonime scraper
// Commands: otakudesu

const path = require('path')

module.exports = {
  command: ["otakudesu"],
  tags: ['anime'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, reply, replyalya } = ctx
    if (!text) return replyalya(`Contoh: *${prefix}${command} naruto*`)
    // Load kusonime_search handler
    try {
      const kusonime_search = require('./kusonime_search')
      return kusonime_search.run(alya, m, ctx)
    } catch(e) {
      replyalya('❌ Fitur anime search sedang tidak tersedia.')
    }
  }
}
