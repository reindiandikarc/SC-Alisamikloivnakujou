// Plugin: soalbahasajepang
// Fixed for Alya V13
// Commands: soalbahasajepang
// Note: animevideo dipisah ke file sendiri agar tidak tumpang tindih

const path = require('path')

module.exports = {
  command: ["soalbahasajepang"],
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

    let timeout = 120000
    let soalId = m.chat

    // ✅ FIX: init sebelum cek
    alya.soalbahasajepang = alya.soalbahasajepang ? alya.soalbahasajepang : {}

    if (soalId in alya.soalbahasajepang) return replyalya('⚠️ Masih ada soal bahasa Jepang yang belum dijawab!\nPilih jawaban A/B/C/D/E terlebih dahulu.\nKetik *nyerah* untuk menyerah.')

    // ✅ FIX: gunakan global.dataSoalJepang yang di-load di alya.js
    if (!global.dataSoalJepang || global.dataSoalJepang.length === 0) {
      return replyalya('❌ Data soal bahasa Jepang tidak tersedia.')
    }

    let soalData = global.dataSoalJepang[Math.floor(Math.random() * global.dataSoalJepang.length)]
    let levelBadge = soalData.level === 'N4' ? '🟡 *Level: JLPT N4*' : '🟢 *Level: JLPT N5*'

    let soalCaption = `🎌 *SOAL BAHASA JEPANG* 🎌\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `${levelBadge}\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `📝 *${soalData.soal}*\n\n` +
      `🅐 ${soalData.pilihan.A}\n` +
      `🅑 ${soalData.pilihan.B}\n` +
      `🅒 ${soalData.pilihan.C}\n` +
      `🅓 ${soalData.pilihan.D}\n` +
      `🅔 ${soalData.pilihan.E}\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `⏳ Waktu: 2 menit\n` +
      `💰 Hadiah: 10.000 - 100.000 Money\n` +
      `⭐ Exp: 500 - 5.000 EXP\n\n` +
      `_Ketik A, B, C, D, atau E untuk menjawab_\n` +
      `_Ketik *nyerah* untuk menyerah_`

    let sentMsg = await replyalya(soalCaption)

    let timer = setTimeout(() => {
      if (alya.soalbahasajepang[soalId]) {
        replyalya(`⏰ Waktu habis!\n\nJawaban yang benar: *${soalData.jawaban}*\n📝 ${soalData.penjelasan}\n\nCoba lagi dengan *.soalbahasajepang*`)
        delete alya.soalbahasajepang[soalId]
      }
    }, timeout)

    alya.soalbahasajepang[soalId] = [sentMsg, soalData, timer]
  }
}
