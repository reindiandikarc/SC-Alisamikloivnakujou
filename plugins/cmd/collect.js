// Plugin: collect
// Auto-generated from Alya V12
// Commands: collect

const path = require('path')

module.exports = {
  command: ["collect"],
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
      function clockString(ms) {
      let h = Math.floor(ms / 3600000)
      let m = Math.floor(ms / 60000) % 60
      let s = Math.floor(ms / 1000) % 60
      console.log({ms,h,m,s})
      return [h, m, s].map(v => v.toString().padStart(2, 0) ).join(':')
    }
        let __timers = (new Date - global.db.users[m.sender].lastclaim)
        let _timers = (43200000 - __timers)
        let timers = clockString(_timers)
        let userAlt = global.db.users[m.sender]
        if (new Date - global.db.users[m.sender].lastclaim > 43200000) {
            replyalya(`Kamu sudah mengclaim dan mendapatkan *1000* 💵money dan *1* 🥤potion`)
            user.money += 1000
            user.potion += 1
            user.lastclaim = new Date * 1
        } else replyalya(`silahkan tunggu *${timers}* lagi untuk bisa mengclaim lagi`)
    }

    //==================================================================
  }
