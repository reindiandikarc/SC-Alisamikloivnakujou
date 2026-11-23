// Plugin: tebakepep
// Ported from Ourin MD 3 → Alya V20
// Tebak karakter Free Fire (Epep) dari gambarnya
// Commands: tebakepep, tep, guessepep

'use strict'

module.exports = {
  command: ["tebakepep", "tep", "guessepep"],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const {
      prefix,
      reply, replyalya, replytolak,
      user, sender
    } = ctx

    if (!m.isGroup) return replytolak('❌ Hanya bisa digunakan di dalam grup!')

    const id = m.chat
    alya.tebakepep = alya.tebakepep || {}

    if (id in alya.tebakepep) {
      const session = alya.tebakepep[id]
      const jawaban = session[1]?.jawaban || '???'
      return replyalya(`⚠️ Masih ada sesi yang belum selesai!\nKetik *nyerah* untuk menyerah.\n💡 Hint: *${jawaban.charAt(0)}${'_'.repeat(Math.max(0, jawaban.length - 2))}${jawaban.charAt(jawaban.length - 1)}*`)
    }

    let data
    try {
      const axios = require('axios')
      const res = await axios.get('https://raw.githubusercontent.com/BochilTeam/database/master/games/tebakepep.json', { timeout: 8000 })
      data = res.data
    } catch {
      try {
        const fs = require('fs')
        const path = require('path')
        const localPath = path.join(process.cwd(), 'data', 'tebakepep.json')
        if (fs.existsSync(localPath)) {
          data = JSON.parse(fs.readFileSync(localPath, 'utf-8'))
        }
      } catch { }
    }

    if (!data || !data.length) return replyalya('❌ Gagal memuat soal, coba lagi nanti!')

    const soal = data[Math.floor(Math.random() * data.length)]
    const timeout = 60000
    const jawaban = soal.jawaban

    let sentMsg
    try {
      sentMsg = await alya.sendMessage(m.chat, {
        image: { url: soal.img || soal.fullimg },
        caption: `🎮 *TEBAK KARAKTER FREE FIRE (EPEP)* 🎮\n━━━━━━━━━━━━━━━━━━\n\n📝 Clue: ${soal.deskripsi}\n\n⏳ Waktu: 60 detik\n💰 Hadiah: Rp15.000 + 3 Limit\n\n_Siapa karakter FF ini? Ketik jawaban atau ketik *nyerah* untuk menyerah_`
      }, { quoted: m })
    } catch {
      sentMsg = await replyalya(`🎮 *TEBAK KARAKTER FREE FIRE (EPEP)* 🎮\n━━━━━━━━━━━━━━━━━━\n\n📝 Clue: ${soal.deskripsi}\n⏳ Waktu: 60 detik\n\n_Siapa karakter FF ini?_`)
    }

    const timer = setTimeout(() => {
      if (alya.tebakepep[id]) {
        replyalya(`⏰ *Waktu Habis!*\nJawaban: *${jawaban}*\n\nCoba lagi? Ketik *${prefix}tebakepep*`)
        delete alya.tebakepep[id]
      }
    }, timeout)

    alya.tebakepep[id] = [sentMsg, { jawaban }, timer]
  }
}
