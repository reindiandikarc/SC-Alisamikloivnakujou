// Plugin: tebakhiragana
// Fixed for Alya V13
// Commands: tebakhiragana
// ✅ FIX: hapus alias "gamewallpaper" yang salah masuk sini

const path = require('path')

module.exports = {
  command: ["tebakhiragana"],
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
    let hiraId = m.chat

    // ✅ FIX: init sebelum cek
    alya.tebakhiragana = alya.tebakhiragana ? alya.tebakhiragana : {}

    if (hiraId in alya.tebakhiragana) return replyalya('⚠️ Masih ada sesi tebak hiragana yang belum selesai!\nKetik *nyerah* untuk menyerah.')

    // ✅ FIX: gunakan global.dataHiragana yang di-load di alya.js
    if (!global.dataHiragana || global.dataHiragana.length === 0) {
      return replyalya('❌ Data hiragana tidak tersedia.')
    }

    let hiraData = global.dataHiragana[Math.floor(Math.random() * global.dataHiragana.length)]

    let hiraCaption = `🎌 *TEBAK HIRAGANA* 🎌\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `Huruf hiragana berikut dibaca apa?\n\n` +
      `🔤 *${hiraData.huruf}*\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `⏳ Waktu: 60 detik\n` +
      `💰 Hadiah: 10.000 - 100.000 Money\n` +
      `⭐ Exp: 500 - 5.000 EXP\n\n` +
      `_Ketik bacaannya dalam romaji (contoh: ka, shi, tsu)_\n` +
      `_Ketik *nyerah* jika tidak tahu_`

    let sentMsg = await replyalya(hiraCaption)

    let timer = setTimeout(() => {
      if (alya.tebakhiragana[hiraId]) {
        replyalya(`⏰ Waktu habis!\n\nJawaban: *${hiraData.romaji}*\n(Huruf: ${hiraData.huruf})\n\nCoba lagi dengan *.tebakhiragana*`)
        delete alya.tebakhiragana[hiraId]
      }
    }, timeout)

    alya.tebakhiragana[hiraId] = [sentMsg, hiraData, timer]
  }
}
