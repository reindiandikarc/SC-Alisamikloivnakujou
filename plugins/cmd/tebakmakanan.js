// Plugin: tebakmakanan
// Ported from Ourin MD 3 → Alya V20
// Commands: tebakmakanan, tmk, guessfood

'use strict'

module.exports = {
  command: ["tebakmakanan", "tmk", "guessfood"],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const {
      prefix,
      reply, replyalya, replytolak,
      user, sender
    } = ctx

    if (!m.isGroup) return replytolak('❌ Hanya bisa digunakan di dalam grup!')

    const id = m.chat
    alya.tebakmakanan = alya.tebakmakanan || {}

    if (id in alya.tebakmakanan) {
      const session = alya.tebakmakanan[id]
      const jawaban = session[1]?.jawaban || '???'
      return replyalya(`⚠️ Masih ada sesi yang belum selesai!\nKetik *nyerah* untuk menyerah.\n💡 Hint: *${jawaban.split('').map((c, i) => i === 0 || i === jawaban.length-1 ? c : '_').join('')}*`)
    }

    let data
    try {
      const axios = require('axios')
      const res = await axios.get('https://raw.githubusercontent.com/BochilTeam/database/master/games/tebakmakanan.json', { timeout: 8000 })
      data = res.data
    } catch {
      // fallback ke data lokal jika ada
      try {
        const fs = require('fs')
        const path = require('path')
        const localPath = path.join(process.cwd(), 'data', 'tebakmakanan.json')
        if (fs.existsSync(localPath)) {
          data = JSON.parse(fs.readFileSync(localPath, 'utf-8'))
        }
      } catch { }
    }

    if (!data || !data.length) return replyalya('❌ Gagal memuat soal, coba lagi nanti!')

    const soal = data[Math.floor(Math.random() * data.length)]
    const timeout = 60000

    const sentMsg = await replyalya(
      `🍜 *TEBAK MAKANAN* 🍜\n━━━━━━━━━━━━━━━━━━\n\n📝 Soal: ${soal.soal}\n\n⏳ Waktu: 60 detik\n💰 Hadiah: Rp10,000 + 2 Limit\n\n_Ketik jawaban kamu! Ketik *nyerah* untuk menyerah_`
    )

    const timer = setTimeout(() => {
      if (alya.tebakmakanan[id]) {
        replyalya(`⏰ *Waktu Habis!*\nJawaban: *${soal.jawaban}*\n\nCoba lagi? Ketik *${prefix}tebakmakanan*`)
        delete alya.tebakmakanan[id]
      }
    }, timeout)

    alya.tebakmakanan[id] = [sentMsg, soal, timer]
  }
}
