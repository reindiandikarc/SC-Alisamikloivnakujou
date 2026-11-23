// Plugin: tebakdrakor
// Ported from Ourin MD 3 → Alya V20
// Tebak judul Drama Korea dari gambar + deskripsi
// Commands: tebakdrakor, drakor, kdrama

'use strict'

module.exports = {
  command: ["tebakdrakor", "drakor", "kdrama"],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const {
      prefix,
      reply, replyalya, replytolak
    } = ctx

    if (!m.isGroup) return replytolak('❌ Hanya bisa digunakan di dalam grup!')

    const id = m.chat
    alya.tebakdrakor = alya.tebakdrakor || {}

    if (id in alya.tebakdrakor) {
      const session = alya.tebakdrakor[id]
      const jawaban = session[1]?.jawaban || '???'
      return replyalya(`⚠️ Masih ada sesi yang belum selesai!\nKetik *nyerah* untuk menyerah.`)
    }

    let data
    try {
      const axios = require('axios')
      const res = await axios.get('https://raw.githubusercontent.com/BochilTeam/database/master/games/tebakdrakor.json', { timeout: 8000 })
      data = res.data
    } catch {
      try {
        const fs = require('fs')
        const path = require('path')
        const localPath = path.join(process.cwd(), 'data', 'tebakdrakor.json')
        if (fs.existsSync(localPath)) data = JSON.parse(fs.readFileSync(localPath, 'utf-8'))
      } catch { }
    }

    if (!data || !data.length) return replyalya('❌ Gagal memuat soal, coba lagi nanti!')

    const soal = data[Math.floor(Math.random() * data.length)]
    const timeout = 60000
    const jawaban = soal.jawaban

    let sentMsg
    try {
      sentMsg = await alya.sendMessage(m.chat, {
        image: { url: soal.img },
        caption: `🇰🇷 *TEBAK DRAMA KOREA* 🇰🇷\n━━━━━━━━━━━━━━━━━━\n\n📝 Deskripsi: ${soal.deskripsi}\n📅 Tahun Rilis: ${soal['tahun rilis'] || '?'}\n\n⏳ Waktu: 60 detik\n💰 Hadiah: Rp15.000 + 3 Limit\n\n_Tebak judul drama Korea ini! Ketik *nyerah* untuk menyerah_`
      }, { quoted: m })
    } catch {
      sentMsg = await replyalya(`🇰🇷 *TEBAK DRAMA KOREA* 🇰🇷\n📝 ${soal.deskripsi}\n⏳ Waktu: 60 detik`)
    }

    const timer = setTimeout(() => {
      if (alya.tebakdrakor[id]) {
        replyalya(`⏰ *Waktu Habis!*\nJawaban: *${jawaban}*\n\nCoba lagi? Ketik *${prefix}tebakdrakor*`)
        delete alya.tebakdrakor[id]
      }
    }, timeout)

    alya.tebakdrakor[id] = [sentMsg, { jawaban }, timer]
  }
}
