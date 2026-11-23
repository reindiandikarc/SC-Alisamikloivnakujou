// Plugin: tebaklirik
// Fixed for Alya V20: proper module.exports, local fallback data, complete braces

'use strict'

// Fallback data lokal jika fetch GitHub gagal
const LIRIK_FALLBACK = [
  { soal: 'Kau buat aku ___, kau buat aku merasa (Hindia - Evaluasi)', jawaban: 'Evaluasi' },
  { soal: 'Aku yang dulu bukanlah ___ yang sekarang (Padi - Semua Tak Sama)', jawaban: 'aku' },
  { soal: 'Karena ___ ini bukan untukku (Noah - Separuh Aku)', jawaban: 'cinta' },
  { soal: 'Dan bila ___ ini bisa kuungkapkan (Sheila on 7 - Dan)', jawaban: 'waktu' },
  { soal: 'Jangan ___ ku, meski kamu mau pergi (Isyana Sarasvati - Tetap Dalam Jiwa)', jawaban: 'tinggalkan' },
  { soal: 'Aku ingin menjadi ___ mu selamanya (Budi Doremi - Aku Ingin)', jawaban: 'milik' },
  { soal: 'Dirimu ___ malam ini, bersinar seperti bintang (Kahitna - Cantik)', jawaban: 'cantik' },
  { soal: 'Karena kamu ___ yang tersisa di hidupku (Fiersa Besari - Waktu yang Salah)', jawaban: 'satu-satunya' },
  { soal: 'Tak ada yang lebih ___ darimu (Raisa - Kali Kedua)', jawaban: 'indah' },
  { soal: 'Mungkin ___ saja yang bisa mengerti (Tulus - Gajah)', jawaban: 'aku' },
]

module.exports = {
  command: ['tebaklirik'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const { prefix, reply, replyalya, replytolak } = ctx

    if (!m.isGroup) return replytolak(global.mess?.only?.group || '❌ Hanya bisa di grup!')

    const id      = m.chat
    const timeout = 60000
    const poin    = Math.floor(Math.random() * (10000 - 3000 + 1)) + 3000

    alya.tebaklirik = alya.tebaklirik || {}

    if (id in alya.tebaklirik) {
      return replyalya('❌ Masih ada sesi *Tebak Lirik* di grup ini!\nJawab dulu atau ketik *nyerah*.')
    }

    // Ambil data soal
    let src = null
    try {
      const res = await fetch(
        'https://raw.githubusercontent.com/BochilTeam/database/master/games/tebaklirik.json',
        { signal: AbortSignal.timeout(6000) }
      )
      if (res.ok) src = await res.json()
    } catch {}

    if (!src || !Array.isArray(src) || !src.length) {
      src = LIRIK_FALLBACK
    }

    const json = src[Math.floor(Math.random() * src.length)]

    const caption =
      `🎶 *GAME TEBAK LIRIK*\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `📝 Lirik:\n_${json.soal}_\n\n` +
      `⏳ Waktu  : 60 detik\n` +
      `💰 Hadiah : ${poin.toLocaleString()} Money\n` +
      `✨ EXP    : +10\n\n` +
      `_Ketik jawaban kamu! Ketik *nyerah* untuk menyerah_`

    const msg = await replyalya(caption)

    alya.tebaklirik[id] = [
      msg,
      json,
      poin,
      setTimeout(() => {
        if (alya.tebaklirik[id]) {
          replyalya(
            `⏰ *Waktu Habis!*\n\n` +
            `Jawaban yang benar:\n*${json.jawaban}*`
          )
          delete alya.tebaklirik[id]
        }
      }, timeout)
    ]
  }
}
