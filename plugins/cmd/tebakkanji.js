// Plugin: tebakkanji
// Auto-generated from Alya V12
// Commands: tebakkanji

const path = require('path')

module.exports = {
  command: ["tebakkanji"],
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
      let timeout = 90000
      let kanjiId = m.chat
      alya.tebakkanji = alya.tebakkanji ? alya.tebakkanji : {}
      if (kanjiId in alya.tebakkanji) return replyalya('⚠️ Masih ada sesi tebak kanji yang belum selesai!\nKetik *nyerah* untuk menyerah.')
      let kanjiData = dataKanji[Math.floor(Math.random() * dataKanji.length)]
      let kanjiCaption = `🎌 *TEBAK KANJI* 🎌\n` +
        `━━━━━━━━━━━━━━━━━━\n\n` +
        `Kanji berikut artinya apa dalam bahasa Indonesia?\n\n` +
        `漢字: *${kanjiData.kanji}*\n` +
        `Bacaan: _${kanjiData.bacaan}_\n\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `⏳ Waktu: 90 detik\n` +
        `💰 Hadiah: 10.000 - 100.000 Money\n` +
        `⭐ Exp: 500 - 5.000 EXP\n\n` +
        `_Ketik arti dalam bahasa Indonesia_\n` +
        `_Ketik *nyerah* jika tidak tahu_`
      alya.tebakkanji[kanjiId] = [
        await replyalya(kanjiCaption),
        kanjiData,
        setTimeout(() => {
          if (alya.tebakkanji[kanjiId]) {
            replyalya(`⏰ Waktu habis!\n\nJawaban: *${kanjiData.arti}*\n(Kanji: ${kanjiData.kanji} | Bacaan: ${kanjiData.bacaan})\n\nCoba lagi dengan *.tebakkanji*`)
            delete alya.tebakkanji[kanjiId]
          }
        }, timeout)
      ]
    }
    //==================================================================
  }
