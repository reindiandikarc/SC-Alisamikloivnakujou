// Plugin: tebakanml
// Fixed for Alya V13 — Full implementation (bukan stub)
// Commands: tebakanml, tebakml, tebakanmalem

const path = require('path')

// Data tebakan ML — nama hero/item Mobile Legends
const ANML_DATA = [
  { soal: "Hero dengan passive 'Immortality' yang bisa bangkit sendiri setelah mati", jawaban: "aldous" },
  { soal: "Hero marksman yang punya skill 'Fanny's Cable'... eh, ini hero siapa yang punya kabel?", jawaban: "fanny" },
  { soal: "Hero tank yang sering disebut 'jual tim' karena skill ultimatenya memindahkan musuh", jawaban: "franco" },
  { soal: "Hero mage yang berubah jadi naga saat menggunakan ultimate", jawaban: "vale" },
  { soal: "Hero assassin yang bisa berjalan di dinding dan langit-langit", jawaban: "gusion" },
  { soal: "Hero marksman legendaris yang punya skill 'Turret Deployment'", jawaban: "claude" },
  { soal: "Hero support yang bisa memanggil drone untuk membantu timnya", jawaban: "angela" },
  { soal: "Hero fighter yang terinspirasi dari Sun Wukong, Raja Monyet", jawaban: "sun" },
  { soal: "Hero tank yang bisa menembak muka musuh dengan skill 1-nya", jawaban: "johnson" },
  { soal: "Hero mage dengan skill yang bisa membuat musuh tertidur", jawaban: "pharsa" },
  { soal: "Hero assassin wanita dengan rambut putih yang punya skill dash sangat cepat", jawaban: "lancelot" },
  { soal: "Hero tank yang bisa berubah menjadi robot raksasa saat ultimate", jawaban: "uranus" },
  { soal: "Hero marksman yang menggunakan busur dan bisa memanggil anak panah besar dari langit", jawaban: "miya" },
  { soal: "Hero support yang bisa me-link dengan rekan satu tim untuk berbagi HP", jawaban: "estes" },
  { soal: "Hero fighter yang punya passive 'The Power of Wolves'", jawaban: "balmond" },
  { soal: "Item yang memberikan efek 'Immortality' alias bisa bangkit sekali setelah mati", jawaban: "immortality" },
  { soal: "Item boots yang memberikan cooldown reduction paling besar di ML", jawaban: "glowing wand" },
  { soal: "Emblem mana yang paling cocok untuk hero marksman?", jawaban: "marksman" },
  { soal: "Mode ranked di ML dimana 5 pemain bermain bersama dalam satu tim", jawaban: "squad" },
  { soal: "Hero yang dijuluki 'Demon of Wind' di Mobile Legends", jawaban: "vale" },
]

module.exports = {
  command: ["tebakanml", "tebakml", "tebakanmalem"],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix, body, budy,
      sender, from, pushname, botNumber,
      isCmd, isGroup, isMedia, isImage, isVideo, isAudio, isSticker,
      isQuotedImage, isQuotedVideo, isQuotedSticker, isQuotedAudio,
      isQuotedDocument, isQuotedViewOnce, isQuotedLocation, isQuotedContact,
      groupMetadata, groupName, groupMembers, groupAdmins, groupOwner,
      isBotAdmins, isGroupAdmins, isAdmins, isAdminOrOwner,
      Ryuu, isPrem, isAly, isAlya, isSewa, jangan,
      quoted, mime, qmsg, content, type, chatUpdate, store,
      reply, replyalya, replytolak, replyprem,
      senderNumber, chath, pes, messagesC, bady,
      waifuList, husbuList, pler, setting, user
    } = ctx

    if (!m.isGroup) return replytolak(mess.only.group)

    // ✅ Cek sesi global.tebakanml yang sudah ada di alya.js
    if (global.tebakanml[m.sender]) {
      return replyalya("⚠️ Kamu masih punya sesi tebakan yang aktif!\nJawab dulu atau ketik *nyerah* untuk menyerah.")
    }

    // Ambil soal random
    let soal = ANML_DATA[Math.floor(Math.random() * ANML_DATA.length)]
    let poin = Math.floor(Math.random() * (5000 - 500 + 1)) + 500

    let caption = `🎮 *TEBAK ANML (MOBILE LEGENDS)* 🎮\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `❓ *Pertanyaan:*\n${soal.soal}\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `⏳ Waktu: 60 detik\n` +
      `⭐ Poin: ${poin} XP\n\n` +
      `_Ketik jawaban kamu! Ketik *nyerah* untuk menyerah_`

    await replyalya(caption)

    // ✅ Simpan ke global.tebakanml (handler jawaban ada di alya.js)
    global.tebakanml[m.sender] = {
      jawaban: soal.jawaban.toLowerCase().trim(),
      poin: poin
    }

    // Auto-delete sesi setelah 60 detik jika belum dijawab
    setTimeout(() => {
      if (global.tebakanml[m.sender]) {
        replyalya(`⏰ Waktu habis!\nJawaban yang benar: *${soal.jawaban}*\n\nCoba lagi? Ketik *.tebakanml*`)
        delete global.tebakanml[m.sender]
      }
    }, 60000)
  }
}
