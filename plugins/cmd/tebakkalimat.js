// Plugin: tebakkalimat
// Auto-generated from Alya V12
// Commands: tebakkalimat

const path = require('path')

module.exports = {
  command: ["tebakkalimat"],
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

      let id = m.chat
      let timeout = 60000

      if (id in alya.tebakkalimat)
        return replyalya('❌ Masih ada sesi tebakkalimat!')

      let src = await fetchJson(
        'https://raw.githubusercontent.com/BochilTeam/database/master/games/tebakkalimat.json'
      )
      let json = src[Math.floor(Math.random() * src.length)]

      let caption = `🧠 *TEBAK KALIMAT*\n\n${json.soal}\n\n⏳ Waktu: 60 detik`

      alya.tebakkalimat[id] = [
        json,
        setTimeout(() => {
          if (alya.tebakkalimat[id]) {
            replyalya(
              `⏰ Waktu Habis!\n\nJawaban: *${json.jawaban}*`
            )
            delete alya.tebakkalimat[id]
          }
        }, timeout)
      ]

      replyalya(caption)
    }

    //==================================================================
  }
