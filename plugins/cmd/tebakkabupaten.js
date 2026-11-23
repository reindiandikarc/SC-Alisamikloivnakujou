// Plugin: tebakkabupaten
// FIX: ganti sleep()+undefined-var → alya.tebakkabupaten + setTimeout

module.exports = {
  command: ["tebakkabupaten"],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { prefix, replyalya, replytolak } = ctx

    if (!m.isGroup) return replytolak('❌ Hanya bisa di grup!')

    alya.tebakkabupaten = alya.tebakkabupaten || {}
    const id = m.chat

    if (alya.tebakkabupaten[id]) return replyalya('❌ Masih ada sesi yang belum selesai!')

    let anu
    try {
      const axios = require('axios')
      const res = await axios.get('https://raw.githubusercontent.com/BochilTeam/database/master/games/tebakkabupaten.json')
      anu = res.data
    } catch { return replyalya('❌ Gagal ambil soal, coba lagi!') }

    const result = anu[Math.floor(Math.random() * anu.length)]
    const timeout = 60000

    const sentMsg = await alya.sendMessage(m.chat, {
      image: { url: result.url },
      caption: `🗺️ *TEBAK KABUPATEN*\n\nSilahkan jawab nama kabupaten/kota dari gambar di atas!\n\n⏳ Waktu: 60 detik\n💡 Ketik *${prefix}nyerah* untuk menyerah`
    }, { quoted: m })

    alya.tebakkabupaten[id] = [
      sentMsg, result,
      setTimeout(async () => {
        if (alya.tebakkabupaten[id]) {
          await alya.sendMessage(m.chat, {
            text: `⏰ *Waktu Habis!*\n\n✅ Jawaban: *${result.title}*`
          }, { quoted: alya.tebakkabupaten[id][0] })
          delete alya.tebakkabupaten[id]
        }
      }, timeout)
    ]
  }
}
