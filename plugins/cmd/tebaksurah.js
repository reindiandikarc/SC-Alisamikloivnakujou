// Plugin: tebaksurah
// FIX: ganti alya.sendFile (tidak ada) → alya.sendMessage audio
//      + isGroup via ctx, + fetch via axios

'use strict'

module.exports = {
  command: ["tebaksurah"],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { prefix, replyalya, replytolak, isGroup } = ctx

    if (!isGroup) return replytolak('❌ Hanya bisa di grup!')

    alya.tebaksurah = alya.tebaksurah || {}
    const id = m.chat

    if (alya.tebaksurah[id]) return replyalya('❌ Masih ada sesi tebak surah yang aktif!')

    const timeout = 120000
    const poin    = 4999
    const ranAyat = Math.floor(Math.random() * 6236) + 1

    let json
    try {
      const axios = require('axios')
      const res = await axios.get(`https://api.alquran.cloud/v1/ayah/${ranAyat}/ar.alafasy`)
      if (res.data?.code !== 200) throw new Error('API error')
      json = res.data.data
    } catch (e) {
      console.error('[tebaksurah] fetch error:', e.message)
      return replyalya('❌ Gagal mengambil ayat, coba lagi!')
    }

    const caption = [
      `🎮 *TEBAK SURAH* 🎮`,
      ``,
      `Dengarkan audio ayat berikut dan tebak nama Surahnya!`,
      ``,
      `🕑 Waktu: 120 detik`,
      `💥 Bonus: ${poin} XP`,
      ``,
      `Ketik *${prefix}nyerah* untuk menyerah`
    ].join('\n')

    const answerInfo = [
      `📖 *Informasi Surah*`,
      `Nama: ${json.surah.englishName} (${json.surah.name})`,
      `Nomor Surah: ${json.surah.number}`,
      `Jumlah Ayat: ${json.surah.numberOfAyahs}`,
      `Tipe: ${json.surah.revelationType}`
    ].join('\n')

    // Kirim teks soal
    const sentMsg = await alya.sendMessage(m.chat, { text: caption }, { quoted: m })

    // Kirim audio 3 detik setelah soal
    setTimeout(async () => {
      try {
        await alya.sendMessage(m.chat, {
          audio: { url: json.audio },
          mimetype: 'audio/mpeg',
          ptt: true
        }, { quoted: sentMsg })
      } catch (e) {
        console.error('[tebaksurah] kirim audio error:', e.message)
      }
    }, 3000)

    // Simpan sesi + timer
    alya.tebaksurah[id] = [
      sentMsg, json,
      setTimeout(async () => {
        if (alya.tebaksurah[id]) {
          // Kirim audio reveal saat waktu habis
          try {
            await alya.sendMessage(m.chat, {
              audio: { url: json.audio },
              mimetype: 'audio/mpeg',
              ptt: true
            }, { quoted: alya.tebaksurah[id][0] })
          } catch {}
          await alya.sendMessage(m.chat, {
            text: `⏰ *Waktu Habis!*\n\n${answerInfo}`
          }, { quoted: alya.tebaksurah[id][0] })
          delete alya.tebaksurah[id]
        }
      }, timeout)
    ]
  }
}
