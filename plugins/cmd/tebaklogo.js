// Plugin: tebaklogo
// Auto-generated from Alya V12
// Commands: tebaklogo

const path = require('path')

module.exports = {
  command: ["tebaklogo"],
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

        if (!m.isGroup) return replytolak('❌ Hanya bisa digunakan di grup!')
        let timeout = 60000 // Waktu 60 detik
        let src = JSON.parse(fs.readFileSync('./database/tebaklogo.json'))
        let json = src[Math.floor(Math.random() * src.length)]

        let clue = json.jawaban.replace(/[AIUEO]/gi, '_')

        let caption = `
    🎮 *Tebak Logo* 🎮

    Deskripsi: "${json.deskripsi}"
    Clue: ${clue}

    Waktu: 60 detik
    Hadiah: 500 MONEY

    Ketik *nyerah* untuk menyerah
        `.trim()

        await alya.sendFile(m.chat, json.img, 'tebaklogo.jpg', caption, m)

        alya.tebaklogo[id] = [
            json,
            setTimeout(() => {
                if (alya.tebaklogo[id]) {
                    reply(`⏳ Waktu habis!\nJawaban: *${json.jawaban}*`) // Beri tahu jawaban jika waktu habis
                    delete alya.tebaklogo[id] // Hapus sesi game
                }
            }, timeout)
        ]
  }
}
