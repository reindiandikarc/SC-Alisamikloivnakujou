// Plugin: maling
// Auto-generated from Alya V12
// Commands: maling

const path = require('path')

module.exports = {
  command: ["maling"],
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

    const db = global.db
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
    const timeout = 604800000

        let userAlt = db.users[m.sender]
        let time = userAlt.lastmaling + 604800000
        if (new Date - userAlt.lastmaling< 604800000) return m.reply(`📮Anda sudah merampok bank\nTunggu selama ⏲️ ${msToTime(time - new Date())} lagi`)
    	let money = `${Math.floor(Math.random() * 30000)}`.trim()
    	let exp = `${Math.floor(Math.random() * 999)}`.trim()
    	let kardus = `${Math.floor(Math.random() * 1000)}`.trim()
    	userAlt.money += money * 1
    	userAlt.exp += exp * 1
    	userAlt.kardus += kardus * 1
    	userAlt.lastmaling = new Date * 1
        m.reply(`Selamat kamu mendapatkan : \n💰+${money} Money\📦+${kardus} Kardus\n✨+${exp} Exp`)
        setTimeout(() => {
            reply(`Yuk waktunya Maling lagi 👋…`)
        }, timeout)
    }
    //==================================================================
  }
