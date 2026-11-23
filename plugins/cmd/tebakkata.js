// Plugin: tebakkata
// Fixed for Alya V13
// Commands: tebakkata

const path = require('path')

module.exports = {
  command: ["tebakkata"],
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

    let timeout = 60000
    let id = m.chat

    // ✅ FIX: init alya.tebakkata sebelum dicek
    alya.tebakkata = alya.tebakkata ? alya.tebakkata : {}

    if (id in alya.tebakkata) return replyalya("⚠️ Masih Ada Sesi Yang Belum Diselesaikan!\nKetik *nyerah* untuk menyerah.")

    let src
    try {
      src = await (await fetch('https://raw.githubusercontent.com/BochilTeam/database/master/games/tebakkata.json')).json()
    } catch (e) {
      return replyalya("❌ Gagal mengambil soal, coba lagi nanti.")
    }

    let json = src[Math.floor(Math.random() * src.length)]
    let caption = `🎮 *TEBAK KATA* 🎮\n━━━━━━━━━━━━━━━━━━\n\n📝 Soal: ${json.soal}\n\n⏳ Waktu: 60 detik\n💰 Hadiah: 10.000 Rupiah\n\n_Ketik jawaban kamu! Ketik *nyerah* untuk menyerah_`

    // ✅ FIX: assign setTimeout ke var terpisah sebelum dimasukkan ke array
    let sentMsg = await replyalya(caption)
    let timer = setTimeout(() => {
      if (alya.tebakkata[id]) {
        replyalya(`⏰ Waktu Habis!\nJawaban: *${json.jawaban}*\n\nCoba lagi? Ketik *.tebakkata*`)
        delete alya.tebakkata[id]
      }
    }, timeout)

    alya.tebakkata[id] = [sentMsg, json, timer]
  }
}
