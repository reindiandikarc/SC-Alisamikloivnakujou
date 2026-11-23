// Plugin: tebaklagu
// FIX: fs require + audio dikirim setelah init sesi (bukan sebelum)

'use strict'
const fs   = require('fs')
const path = require('path')

module.exports = {
  command: ["tebaklagu"],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { prefix, replyalya, replytolak } = ctx

    if (!m.isGroup) return replytolak('❌ Hanya bisa di grup!')

    alya.tebaklagu = alya.tebaklagu || {}
    const id = m.chat

    if (alya.tebaklagu[id]) return replyalya('❌ Masih ada sesi tebak lagu yang aktif!')

    // Load data lagu dari file lokal
    let src
    try {
      const rawPath = path.join(__dirname, '../../lib/tebaklagu.json')
      src = JSON.parse(fs.readFileSync(rawPath, 'utf-8'))
    } catch (e) {
      console.error('[tebaklagu] gagal load data:', e.message)
      return replyalya('❌ Gagal load data lagu, coba lagi!')
    }

    const json = src[Math.floor(Math.random() * src.length)]
    const timeout = 60000

    // Kirim info dulu
    const sentMsg = await alya.sendMessage(m.chat, {
      text: `🎵 *TEBAK LAGU*\n\n🎤 Artist: *${json.artist}*\n\n⏳ Waktu: 60 detik\nDengarkan audio di bawah dan tebak judul lagunya!\n\n💡 Ketik *${prefix}nyerah* untuk menyerah`
    }, { quoted: m })

    // Kirim audio setelah 1 detik
    setTimeout(async () => {
      try {
        await alya.sendMessage(m.chat, {
          audio: { url: json.link_song },
          mimetype: 'audio/mpeg'
        }, { quoted: sentMsg })
      } catch (e) {
        console.error('[tebaklagu] gagal kirim audio:', e.message)
      }
    }, 1000)

    // Simpan sesi
    alya.tebaklagu[id] = [
      sentMsg, json,
      setTimeout(async () => {
        if (alya.tebaklagu[id]) {
          await alya.sendMessage(m.chat, {
            text: `⏰ *Waktu Habis!*\n\n✅ Jawaban: *${json.jawaban}*\n🎤 Artist: *${json.artist}*`
          }, { quoted: alya.tebaklagu[id][0] })
          delete alya.tebaklagu[id]
        }
      }, timeout)
    ]
  }
}
