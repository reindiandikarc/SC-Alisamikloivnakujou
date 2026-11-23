// Plugin: caklontong
// Auto-generated from Alya V12
// Commands: caklontong

const path = require('path')

module.exports = {
  command: ["caklontong"],
  tags: ['general'],
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
    if (caklontong.hasOwnProperty(m.sender.split('@')[0])) return replyalya("Masih Ada Sesi Yang Belum Diselesaikan!")
     let anu = await fetchJson('https://raw.githubusercontent.com/BochilTeam/database/master/games/caklontong.json')
     let result = anu[Math.floor(Math.random() * anu.length)]
     alya.sendText(from, `*Jawablah Pertanyaan Berikut :*\n${result.soal}*\nWaktu : 60s`, m).then(() => {
     caklontong[m.sender.split('@')[0]] = result.jawaban.toLowerCase()
    caklontong_desk[m.sender.split('@')[0]] = result.deskripsi
     })
     await sleep(60000)
     if (caklontong.hasOwnProperty(m.sender.split('@')[0])) {
     console.log("Jawaban: " + result.jawaban)
     alya.sendMessage(m.chat, { image: { url: 'https://telegra.ph/file/96bb6ca28d6ef7fea479f.jpg' }, caption:`Waktu Habis\nJawaban:  ${caklontong[m.sender.split('@')[0]]}\nDeskripsi : ${caklontong_desk[m.sender.split('@')[0]]}\n\nIngin bermain? Ketik tebak lontong`}, {quoted:m})
     delete caklontong[m.sender.split('@')[0]]
    delete caklontong_desk[m.sender.split('@')[0]]
     }
    }
    //==================================================================
  }
