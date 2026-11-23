// Plugin: nebang
// Auto-generated from Alya V12
// Commands: nebang

const path = require('path')

module.exports = {
  command: ["nebang"],
  tags: ['admin'],
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
      function msToTime(duration) {
        var milliseconds = parseInt((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

        hours = (hours < 10) ? "0" + hours : hours
        minutes = (minutes < 10) ? "0" + minutes : minutes
        seconds = (seconds < 10) ? "0" + seconds : seconds

        return hours + " jam " + minutes + " menit " + seconds + " detik"
    }
    	  let userAlt = global.db.users[m.sender]
        let time = user.lastparming + 1800000
        if (new Date - user.lastparming < 1800000) return replyalya(`Anda sudah lelah untuk bekerja\nTunggu selama ${msToTime(time - new Date())} lagi`)
    	let wood = `${Math.floor(Math.random() * 50)}`.trim()
    	let money = `${Math.floor(Math.random() * 50000)}`.trim()
    	user.wood += wood * 1
    	user.money += money * 1
    	user.lastparming = new Date * 1
        replyalya(`Selamat kamu mendapatkan : \n+${wood} Kayu\n+${money} Money`)
    }
  }
