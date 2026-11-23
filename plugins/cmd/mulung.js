// Plugin: mulung
// Auto-generated from Alya V12
// Commands: mulung

const path = require('path')

module.exports = {
  command: ["mulung"],
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
        let time = user.lastmulung + 1800000

        if (new Date - user.lastmulung < 1800000) return replyalya(`Anda sudah lelah untuk mulung\nTunggu selama ${msToTime(time - new Date())} lagi`)

        let botol = Math.floor(Math.random() * 1000)
        let kaleng = Math.floor(Math.random() * 1000)
        let kardus = Math.floor(Math.random() * 1000)
        let gelas = Math.floor(Math.random() * 1000)
        let plastik = Math.floor(Math.random() * 1000)

        user.botol += botol * 1
        user.kaleng += kaleng * 1
        user.kardus += kardus * 1
        user.gelas += gelas * 1
        user.plastik += plastik * 1
        user.lastmulung = new Date * 1
        replyalya(`Selamat kamu mendapatkan : \n+${botol} Botol\n+${kaleng} Kaleng\n+${kardus} Kardus\n+${gelas} Gelas\n+${plastik} Plastik`)
  }
}
