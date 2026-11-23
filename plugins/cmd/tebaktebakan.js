// Plugin: tebaktebakan
// FIX: ganti sleep()+undefined-var → alya.sesi + setTimeout

module.exports = {
  command: ["tebaktebakan"],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { prefix, replyalya, replytolak } = ctx

    if (!m.isGroup) return replytolak('❌ Hanya bisa di grup!')

    alya.tebaktebakan = alya.tebaktebakan || {}
    const id = m.chat

    if (alya.tebaktebakan[id]) return replyalya('❌ Masih ada sesi yang belum selesai!')

    let anu
    try {
      const axios = require('axios')
      const res = await axios.get('https://raw.githubusercontent.com/BochilTeam/database/master/games/tebaktebakan.json')
      anu = res.data
    } catch { return replyalya('❌ Gagal ambil soal, coba lagi!') }

    const result = anu[Math.floor(Math.random() * anu.length)]
    const timeout = 60000

    const sentMsg = await alya.sendMessage(m.chat, {
      text: `🧠 *TEBAK-TEBAKAN*\n\n❓ *${result.soal}*\n\n⏳ Waktu: 60 detik\n💡 Ketik *${prefix}nyerah* untuk menyerah`
    }, { quoted: m })

    alya.tebaktebakan[id] = [
      sentMsg, result,
      setTimeout(async () => {
        if (alya.tebaktebakan[id]) {
          await alya.sendMessage(m.chat, {
            text: `⏰ *Waktu Habis!*\n\n✅ Jawaban: *${result.jawaban}*`
          }, { quoted: alya.tebaktebakan[id][0] })
          delete alya.tebaktebakan[id]
        }
      }, timeout)
    ]
  }
}
