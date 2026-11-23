// Plugin: tebakbenderav2
// FIX: ganti sleep()+undefined-var → alya.tebakbenderav2 + setTimeout

module.exports = {
  command: ["tebakbenderav2"],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { prefix, replyalya, replytolak } = ctx

    if (!m.isGroup) return replytolak('❌ Hanya bisa di grup!')

    alya.tebakbenderav2 = alya.tebakbenderav2 || {}
    const id = m.chat

    if (alya.tebakbenderav2[id]) return replyalya('❌ Masih ada sesi yang belum selesai!')

    let anu
    try {
      const axios = require('axios')
      const res = await axios.get('https://raw.githubusercontent.com/BochilTeam/database/master/games/tebakbendera.json')
      anu = res.data
    } catch { return replyalya('❌ Gagal ambil soal, coba lagi!') }

    const result = anu[Math.floor(Math.random() * anu.length)]
    const timeout = 60000

    const sentMsg = await alya.sendMessage(m.chat, {
      image: { url: result.img },
      caption: `🏳️ *TEBAK BENDERA*\n\nSilahkan jawab nama negara dari bendera di atas!\n\n🔍 Clue: ${result.flag}\n⏳ Waktu: 60 detik\n💡 Ketik *${prefix}nyerah* untuk menyerah`
    }, { quoted: m })

    alya.tebakbenderav2[id] = [
      sentMsg, result,
      setTimeout(async () => {
        if (alya.tebakbenderav2[id]) {
          await alya.sendMessage(m.chat, {
            text: `⏰ *Waktu Habis!*\n\n✅ Jawaban: *${result.name}*`
          }, { quoted: alya.tebakbenderav2[id][0] })
          delete alya.tebakbenderav2[id]
        }
      }, timeout)
    ]
  }
}
