// Plugin: tebakbendera2
// FIX: ganti sleep()+undefined-var → alya.tebakbendera2 + setTimeout

module.exports = {
  command: ["tebakbendera2"],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { prefix, replyalya, replytolak } = ctx

    if (!m.isGroup) return replytolak('❌ Hanya bisa di grup!')

    alya.tebakbendera2 = alya.tebakbendera2 || {}
    const id = m.chat

    if (alya.tebakbendera2[id]) return replyalya('❌ Masih ada sesi yang belum selesai!')

    let anu
    try {
      const axios = require('axios')
      const res = await axios.get('https://raw.githubusercontent.com/BochilTeam/database/master/games/tebakbendera2.json')
      anu = res.data
    } catch { return replyalya('❌ Gagal ambil soal, coba lagi!') }

    const result = anu[Math.floor(Math.random() * anu.length)]
    const timeout = 60000

    const sentMsg = await alya.sendMessage(m.chat, {
      image: { url: result.img },
      caption: `🏳️ *TEBAK BENDERA v2*\n\nSilahkan jawab nama negara dari bendera di atas!\n\n⏳ Waktu: 60 detik\n💡 Ketik *${prefix}nyerah* untuk menyerah`
    }, { quoted: m })

    alya.tebakbendera2[id] = [
      sentMsg, result,
      setTimeout(async () => {
        if (alya.tebakbendera2[id]) {
          await alya.sendMessage(m.chat, {
            text: `⏰ *Waktu Habis!*\n\n✅ Jawaban: *${result.name}*`
          }, { quoted: alya.tebakbendera2[id][0] })
          delete alya.tebakbendera2[id]
        }
      }, timeout)
    ]
  }
}
