// Plugin: tebakgambar
// Fixed for Alya V13
// Commands: tebakgambar

const path = require('path')

module.exports = {
  command: ["tebakgambar"],
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

    // ✅ FIX: init alya.tebakgambar & cek sesi yang benar (bukan alya.tebakkata!)
    alya.tebakgambar = alya.tebakgambar ? alya.tebakgambar : {}

    if (id in alya.tebakgambar) return replyalya("⚠️ Masih Ada Sesi Yang Belum Diselesaikan!\nKetik *nyerah* untuk menyerah.")

    let tos
    try {
      let anu = await fetchJson('https://raw.githubusercontent.com/BochilTeam/database/master/games/tebakgambar.json')
      tos = anu[Math.floor(Math.random() * anu.length)]
    } catch (e) {
      return replyalya("❌ Gagal mengambil soal, coba lagi nanti.")
    }

    let caption = `🖼️ *TEBAK GAMBAR* 🖼️\n━━━━━━━━━━━━━━━━━━\n\n📝 Deskripsi: ${tos.deskripsi}\n\n⏳ Waktu: 60 detik\n💰 Hadiah: 10.000 Money\n\n_Jawab nama gambar di atas! Ketik *nyerah* untuk menyerah_`

    // ✅ FIX: assign setTimeout ke var terpisah
    let sentMsg = await alya.sendMessage(from, {
      caption: caption,
      image: { url: tos.img }
    }, { quoted: m })

    let timer = setTimeout(() => {
      if (alya.tebakgambar[id]) {
        replyalya(`⏰ Waktu Habis!\nJawaban: *${tos.jawaban}*\n\nCoba lagi? Ketik *.tebakgambar*`)
        delete alya.tebakgambar[id]
      }
    }, timeout)

    alya.tebakgambar[id] = [sentMsg, tos, timer]
  }
}
