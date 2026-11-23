// Plugin: tebakkimia
// FIX: ganti sleep()+undefined-var → alya.tebakkimia + setTimeout

module.exports = {
  command: ["tebakkimia"],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { prefix, replyalya, replytolak } = ctx

    if (!m.isGroup) return replytolak('❌ Hanya bisa di grup!')

    alya.tebakkimia = alya.tebakkimia || {}
    const id = m.chat

    if (alya.tebakkimia[id]) return replyalya('❌ Masih ada sesi yang belum selesai!')

    let anu
    try {
      const axios = require('axios')
      const res = await axios.get('https://raw.githubusercontent.com/BochilTeam/database/master/games/tebakkimia.json')
      anu = res.data
    } catch { return replyalya('❌ Gagal ambil soal, coba lagi!') }

    const result = anu[Math.floor(Math.random() * anu.length)]
    const timeout = 60000

    const sentMsg = await alya.sendMessage(m.chat, {
      text: `🧪 *TEBAK KIMIA*\n\nApa lambang unsur dari:\n\n⚗️ *${result.unsur}*\n\n⏳ Waktu: 60 detik\n💡 Ketik *${prefix}nyerah* untuk menyerah`
    }, { quoted: m })

    alya.tebakkimia[id] = [
      sentMsg, result,
      setTimeout(async () => {
        if (alya.tebakkimia[id]) {
          await alya.sendMessage(m.chat, {
            text: `⏰ *Waktu Habis!*\n\n✅ Jawaban: *${result.lambang}*`
          }, { quoted: alya.tebakkimia[id][0] })
          delete alya.tebakkimia[id]
        }
      }, timeout)
    ]
  }
}
