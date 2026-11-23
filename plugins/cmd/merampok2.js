// Plugin: merampok2
// Auto-generated from Alya V12
// Commands: merampok2

const path = require('path')

module.exports = {
  command: ["merampok2"],
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
    function pickRandom(list) {
        return list[Math.floor(Math.random() * list.length)]
    }

    function clockString(ms) {
        let h = Math.floor(ms / 3600000)
        let m = Math.floor(ms / 60000) % 60
        let s = Math.floor(ms / 1000) % 60
        return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
    }
        let dapat = (Math.floor(Math.random() * 100000))
        let users = global.global.db.users
        let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender
        if (!who) return replyalya('Tag orang yang mau kamu Rampok!')
        if (typeof global.global.db.users[who] == 'undefined') return replyalya('Pengguna tidak ada didalam database')
        if (users[who].level > users[m.sender].level) return replyalya(`Level kamu harus lebih tinggi dari @${who.split('@')[0]} Untuk bisa merampoknya!`, false, { mentions: [who] })
        let __timers = (new Date - global.global.db.users[m.sender].lastrampok)
        let _timers = (3600000 - __timers)
        let timers = clockString(_timers)
        if (new Date - global.global.db.users[m.sender].lastrampok > 3600000) {
            if (10000 > users[who].money) return replyalya('ᴛᴀʀɢᴇᴛ ɢᴀᴀᴅᴀ 💰ᴜᴀɴɢ ʙᴏᴅᴏʜ, ᴋɪꜱᴍɪɴ ᴅɪᴀ')
            users[who].money -= dapat * 1
            users[m.sender].money += dapat * 1
            global.global.db.users[m.sender].lastrampok = new Date * 1
            replyalya( `ʙᴇʀʜᴀꜱɪʟ ᴍᴇʀᴀᴍᴘᴏᴋ ᴍᴏɴᴇʏ ᴛᴀʀɢᴇᴛ ꜱᴇʙᴇꜱᴀʀ 💰${dapat}`)
        } else replyalya( `Anda Sudah merampok dan berhasil sembunyi , tunggu ${timers} untuk merampok lagi`)
    }
  }
