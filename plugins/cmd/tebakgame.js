// Plugin: tebakgame
// Fixed for Alya V20: fs require, id variable, sendFile→sendMessage, data path fallback

'use strict'

const fs   = require('fs')
const path = require('path')

// Data tebakan game lokal (fallback jika file tidak ada)
const TEBAKGAME_LOCAL = [
  { soal: 'Game battle royale populer yang menampilkan 100 pemain di sebuah pulau', jawaban: 'PUBG', img: null },
  { soal: 'Game MOBA mobile dari Moonton yang sangat populer di Asia Tenggara', jawaban: 'Mobile Legends', img: null },
  { soal: 'Game survival horror dengan karakter Leon S. Kennedy', jawaban: 'Resident Evil', img: null },
  { soal: 'Game open world di mana kamu bisa jadi penjahat di kota fiksi', jawaban: 'GTA', img: null },
  { soal: 'Game rhythm Jepang dengan karakter Hatsune Miku', jawaban: 'Project Diva', img: null },
  { soal: 'Game RPG turn-based gacha populer dari miHoYo dengan dunia Teyvat', jawaban: 'Genshin Impact', img: null },
  { soal: 'Game battle royale mobile dari Garena yang populer di Indonesia', jawaban: 'Free Fire', img: null },
  { soal: 'Game MOBA PC dari Valve yang terkenal sangat sulit', jawaban: 'Dota 2', img: null },
  { soal: 'Game sandbox di mana pemain membangun dunia dari balok-balok kotak', jawaban: 'Minecraft', img: null },
  { soal: 'Game hero shooter 5v5 dari Riot Games', jawaban: 'Valorant', img: null },
]

module.exports = {
  command: ['tebakgame'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const {
      prefix,
      reply, replyalya, replytolak
    } = ctx

    if (!m.isGroup) return replytolak('❌ Hanya bisa digunakan di grup!')

    const id = m.chat
    alya.game = alya.game || {}

    if (('tebakgame-' + id) in alya.game) {
      return replyalya('❌ Masih ada sesi *Tebak Game* yang aktif di grup ini!')
    }

    const gameId = 'tebakgame-' + id
    const timeout = 120000
    const poin    = 4999

    // Load data soal — coba file lokal dulu
    let src = null
    const localPath = path.join(process.cwd(), 'database', 'tebakgame.json')
    if (fs.existsSync(localPath)) {
      try { src = JSON.parse(fs.readFileSync(localPath, 'utf-8')) } catch {}
    }
    if (!src || !src.length) src = TEBAKGAME_LOCAL

    const json = src[Math.floor(Math.random() * src.length)]
    const clue  = json.jawaban.replace(/[AaIiUuEeOo]/g, '_')

    const caption =
      `🎮 *TEBAK GAME* 🎮\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `❓ Tebak game apakah ini?\n\n` +
      `📝 Soal  : ${json.soal}\n` +
      `💡 Clue  : *${clue}*\n\n` +
      `⏳ Waktu : 120 detik\n` +
      `⭐ Bonus : ${poin} XP\n\n` +
      `_Ketik jawaban kamu! Ketik *nyerah* untuk menyerah_`

    const sentMsg = await replyalya(caption)

    // Kirim gambar jika ada
    if (json.img) {
      try {
        await alya.sendMessage(m.chat, { image: { url: json.img }, caption: '' }, { quoted: sentMsg })
      } catch (e) {
        console.error('[tebakgame] gagal kirim gambar:', e.message)
      }
    }

    const timer = setTimeout(() => {
      if (alya.game[gameId]) {
        replyalya(`⏳ *Waktu Habis!*\nJawaban: *${json.jawaban}*\n\nCoba lagi? Ketik *${prefix}tebakgame*`)
        delete alya.game[gameId]
      }
    }, timeout)

    // Format: [json, timer, sentMsg] — index[1] = json (sesuai handler alya.js)
    alya.game[gameId] = [sentMsg, json, timer, timer]
  }
}
