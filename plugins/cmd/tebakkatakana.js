// Plugin: tebakkatakana
// Fixed for Alya V13
// Commands: tebakkatakana

const path = require('path')

module.exports = {
  command: ["tebakkatakana"],
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
    let kataId = m.chat

    // ✅ FIX: init sebelum cek
    alya.tebakkatakana = alya.tebakkatakana ? alya.tebakkatakana : {}

    if (kataId in alya.tebakkatakana) return replyalya('⚠️ Masih ada sesi tebak katakana yang belum selesai!\nKetik *nyerah* untuk menyerah.')

    // ✅ FIX: gunakan global.dataKatakana yang di-load di alya.js
    if (!global.dataKatakana || global.dataKatakana.length === 0) {
      return replyalya('❌ Data katakana tidak tersedia.')
    }

    let kataData = global.dataKatakana[Math.floor(Math.random() * global.dataKatakana.length)]

    let kataCaption = `🎌 *TEBAK KATAKANA* 🎌\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `Huruf katakana berikut dibaca apa?\n\n` +
      `🔤 *${kataData.huruf}*\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `⏳ Waktu: 60 detik\n` +
      `💰 Hadiah: 10.000 - 100.000 Money\n` +
      `⭐ Exp: 500 - 5.000 EXP\n\n` +
      `_Ketik bacaannya dalam romaji (contoh: ka, shi, tsu)_\n` +
      `_Ketik *nyerah* jika tidak tahu_`

    let sentMsg = await replyalya(kataCaption)

    let timer = setTimeout(() => {
      if (alya.tebakkatakana[kataId]) {
        replyalya(`⏰ Waktu habis!\n\nJawaban: *${kataData.romaji}*\n(Huruf: ${kataData.huruf})\n\nCoba lagi dengan *.tebakkatakana*`)
        delete alya.tebakkatakana[kataId]
      }
    }, timeout)

    alya.tebakkatakana[kataId] = [sentMsg, kataData, timer]
  }
}
