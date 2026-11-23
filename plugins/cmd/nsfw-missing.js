// Plugin: nsfw-missing
// Commands: ahegao, ass, bdsm, blowjob, cuckold, cum, eba, ero, femdom,
//           gangbang, glasses, jahy, masturbation, neko-hentai, orgy,
//           panties, pussy, tentacles
// FIXED: plugin baru untuk semua command nsfw yang hilang dari hentaimenu
// Menggunakan waifu.pics API (gratis, no API key)

'use strict'

// Map command → endpoint waifu.pics nsfw
const NSFW_MAP = {
  ahegao:       'ahegao',
  ass:          'ass',
  bdsm:         'bdsm',
  blowjob:      'blowjob',
  cuckold:      'hentai',
  cum:          'cum',
  eba:          'ecchi',
  ero:          'ero',
  femdom:       'femdom',
  gangbang:     'gangbang',
  glasses:      'glasses',
  jahy:         'nsfwwallpaper',
  masturbation: 'masturbation',
  'neko-hentai':'hentai',
  orgy:         'orgy',
  panties:      'panties',
  pussy:        'pussy',
  tentacles:    'tentacles',
}

module.exports = {
  command: Object.keys(NSFW_MAP),
  tags: ['nsfw'],
  run: async (alya, m, ctx) => {
    const { command, replyalya, replyprem } = ctx

    if (!ctx.isPrem && !ctx.Ryuu) return replyprem(global.mess?.only?.premium || '❌ Khusus Premium!')

    const endpoint = NSFW_MAP[command]
    if (!endpoint) return replyalya('❌ Konten tidak ditemukan.')

    await alya.sendMessage(m.chat, { react: { text: '🔞', key: m.key } })

    try {
      const axios = require('axios')
      const res = await axios.get(`https://api.waifu.pics/nsfw/${endpoint}`, { timeout: 10000 })
      const url = res.data?.url
      if (!url) throw new Error('URL tidak ditemukan dari API')

      await alya.sendMessage(m.chat, {
        image: { url },
        caption: global.mess?.success || '✅ Done!'
      }, { quoted: m })

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
      console.error(`[nsfw-missing:${command}]`, e.message)
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      replyalya(`❌ Gagal mengambil konten *${command}*.\n_${e.message}_`)
    }
  }
}
