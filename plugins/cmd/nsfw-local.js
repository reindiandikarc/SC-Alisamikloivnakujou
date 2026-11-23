// Plugin: nsfw-local
// Commands: ahegao, ass, bdsm, blowjob, cuckold, cum, eba, ero, femdom,
//           foot, gangbang, glasses, jahy, masturbation, neko-hentai,
//           neko-hentai2, nsfwloli, orgy, panties, pussy, tentacles, thighs
// Sumber: data/AlyaMedia/nsfw/*.json (local)
// Akses: Premium only

'use strict'
const fs   = require('fs')
const path = require('path')

const NSFW_DATA_DIR = path.join(__dirname, '../../data/AlyaMedia/nsfw')

const CMD_TO_FILE = {
  ahegao:        'ahegao.json',
  ass:           'ass.json',
  bdsm:          'bdsm.json',
  blowjob:       'blowjob.json',
  cuckold:       'cuckold.json',
  cum:           'cum.json',
  eba:           'eba.json',
  ero:           'ero.json',
  femdom:        'femdom.json',
  foot:          'foot.json',
  gangbang:      'gangbang.json',
  glasses:       'glasses.json',
  jahy:          'jahy.json',
  masturbation:  'masturbation.json',
  'neko-hentai': 'neko.json',
  'neko-hentai2':'neko2.json',
  nsfwloli:      'nsfwloli.json',
  orgy:          'orgy.json',
  panties:       'panties.json',
  pussy:         'pussy.json',
  tentacles:     'tentacles.json',
  thighs:        'thighs.json',
}

module.exports = {
  command: Object.keys(CMD_TO_FILE),
  tags: ['nsfw'],
  run: async (alya, m, ctx) => {
    const { command, isPrem, Ryuu, replyalya, replyprem } = ctx

    if (!isPrem && !Ryuu) return replyprem(global.mess?.only?.premium || '❌ Fitur ini khusus *Premium*!')

    const file = CMD_TO_FILE[command]
    if (!file) return replyalya('❌ Konten tidak tersedia.')

    await alya.sendMessage(m.chat, { react: { text: '🔞', key: m.key } })

    try {
      const raw  = JSON.parse(fs.readFileSync(path.join(NSFW_DATA_DIR, file), 'utf8'))
      const pick = raw[Math.floor(Math.random() * raw.length)]
      const url  = typeof pick === 'string' ? pick : pick.url

      await alya.sendMessage(m.chat, {
        image: { url },
        caption: global.mess?.success || '✅ Done!'
      }, { quoted: m })

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
      console.error(`[nsfw-local:${command}]`, e.message)
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      replyalya(`❌ Gagal mengambil konten *${command}*.`)
    }
  }
}
