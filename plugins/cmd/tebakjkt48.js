// Plugin: tebakjkt48
// Ported from Ourin MD 3 → Alya V20
// Tebak nama member JKT48 dari fotonya
// Commands: tebakjkt48, tjkt, jkt48

'use strict'

module.exports = {
  command: ["tebakjkt48", "tjkt", "jkt48"],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const {
      prefix,
      reply, replyalya, replytolak
    } = ctx

    if (!m.isGroup) return replytolak('❌ Hanya bisa digunakan di dalam grup!')

    const id = m.chat
    alya.tebakjkt48 = alya.tebakjkt48 || {}

    if (id in alya.tebakjkt48) {
      return replyalya(`⚠️ Masih ada sesi yang belum selesai!\nKetik *nyerah* untuk menyerah.`)
    }

    let data
    try {
      const axios = require('axios')
      const res = await axios.get('https://raw.githubusercontent.com/BochilTeam/database/master/games/tebakjkt48.json', { timeout: 8000 })
      data = res.data
    } catch {
      try {
        const fs = require('fs')
        const path = require('path')
        const localPath = path.join(process.cwd(), 'data', 'tebakjkt48.json')
        if (fs.existsSync(localPath)) data = JSON.parse(fs.readFileSync(localPath, 'utf-8'))
      } catch { }
    }

    if (!data || !data.length) return replyalya('❌ Gagal memuat soal, coba lagi nanti!')

    const soal = data[Math.floor(Math.random() * data.length)]
    const timeout = 60000
    const jawaban = soal.jawaban?.toLowerCase()

    let sentMsg
    try {
      sentMsg = await alya.sendMessage(m.chat, {
        image: { url: soal.img },
        caption: `🎀 *TEBAK MEMBER JKT48* 🎀\n━━━━━━━━━━━━━━━━━━\n\n🖼️ Siapa member JKT48 ini?\n\n⏳ Waktu: 60 detik\n💰 Hadiah: Rp15.000 + 3 Limit\n\n_Ketik nama member! Ketik *nyerah* untuk menyerah_`
      }, { quoted: m })
    } catch {
      sentMsg = await replyalya(`🎀 *TEBAK MEMBER JKT48* 🎀\nGagal load gambar, ketik *nyerah* untuk skip.`)
    }

    const timer = setTimeout(() => {
      if (alya.tebakjkt48[id]) {
        replyalya(`⏰ *Waktu Habis!*\nJawaban: *${soal.jawaban}*\n\nCoba lagi? Ketik *${prefix}tebakjkt48*`)
        delete alya.tebakjkt48[id]
      }
    }, timeout)

    alya.tebakjkt48[id] = [sentMsg, { jawaban }, timer]
  }
}
