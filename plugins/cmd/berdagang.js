// Plugin: berdagang
// Auto-generated from Alya V12
// Commands: berdagang

const path = require('path')

module.exports = {
  command: ["berdagang"],
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
      console.log({ms,h,m,s})
      return [h, m, s].map(v => v.toString().padStart(2, 0) ).join(':')
    }

        let dapat = (Math.floor(Math.random() * 5000))
        let who
        if (m.isGroup) who = m.mentionedJid[0]
        else who = m.chat
        if (!who) return replyalya ('Tag salah satu lah, yang kamu ingin berdagang bareng')
        if (typeof global.db.users[who] == 'undefined') return replyalya('Pengguna tidak ada didalam data base')
        let __timers = (new Date - global.db.users[m.sender].lastdagang)
        let _timers = (28800000 - __timers)
        let timers = clockString(_timers)
        let users = global.db.users
        let username = alya.getName(who)
        if (new Date - global.db.users[m.sender].lastdagang > 28800000) {
            if (4999 > users[who].money) return replyalya ('Target tidak memiliki modal harap masukkan modal 5000')
            if (4999 > users[m.sender].money) return replyalya ('kamu tidak memiliki modal harap masukkan modal 5000')
            users[who].money -= dapat * 1
            users[m.sender].money -= dapat * 1
            global.db.users[m.sender].lastdagang = new Date * 1
            replyalya(`Mohon tunggu kak..\nKamu dan @${who.replace(/@.+/, '')} sedang berdagang.. ðŸ˜…\n\nKamu dan @${who.replace(/@.+/, '')} meletakkan modal -${dapat} ðŸ˜…`)
            setTimeout(() => {
                replyalya(m.chat, `Selamat kamu dan @${who.replace(/@.+/, '')} mendapatkan money..\n\nPenghasilan dagang kamu didapatkan +50000\n${users[m.sender].money += 50000} Money kamu\n\nPenghasilan dagang @${who.replace(/@.+/, '')} didapatkan +50000\n${users[who].money += 50000} Money @${who.replace(/@.+/, '')}`, m, {
    contextInfo: {
    mentionedJid: [m.sender, who]
    }})
            }, 3600000)
            setTimeout(() => {
                replyalya(`Selamat kamu dan @${who.replace(/@.+/, '')} mendapatkan money..\n\nPenghasilan dagang kamu didapatkan +50000\n${users[m.sender].money += 50000} Money kamu\n\nPenghasilan dagang @${who.replace(/@.+/, '')} didapatkan +50000\n${users[who].money += 50000} Money @${who.replace(/@.+/, '')}`, {
    contextInfo: {
    mentionedJid: [m.sender, who]
    }})
            }, 7200000)
            setTimeout(() => {
                replyalya( `Selamat kamu dan @${who.replace(/@.+/, '')} mendapatkan money..\n\nPenghasilan dagang kamu didapatkan +50000\n${users[m.sender].money += 50000} Money kamu\n\nPenghasilan dagang @${who.replace(/@.+/, '')} didapatkan +50000\n${users[who].money += 50000} Money @${who.replace(/@.+/, '')}`,{
    contextInfo: {
    mentionedJid: [m.sender, who]
    }})
            }, 10800000)
            setTimeout(() => {
                replyalya( `Selamat kamu dan @${who.replace(/@.+/, '')} mendapatkan money..\n\nPenghasilan dagang kamu didapatkan +50000\n${users[m.sender].money += 50000} Money kamu\n\nPenghasilan dagang @${who.replace(/@.+/, '')} didapatkan +50000\n${users[who].money += 50000} Money @${who.replace(/@.+/, '')}`,{
    contextInfo: {
    mentionedJid: [m.sender, who]
    }})
            }, 14400000)
            setTimeout(() => {
                replyalya( `Selamat kamu dan @${who.replace(/@.+/, '')} mendapatkan money..\n\nPenghasilan dagang kamu didapatkan +50000\n${users[m.sender].money += 50000} Money kamu\n\nPenghasilan dagang @${who.replace(/@.+/, '')} didapatkan +50000\n${users[who].money += 50000} Money @${who.replace(/@.+/, '')}`,{
    contextInfo: {
    mentionedJid: [m.sender, who]
    }})
            }, 18000000)
            setTimeout(() => {
                replyalya( `Selamat kamu dan @${who.replace(/@.+/, '')} mendapatkan money..\n\nPenghasilan dagang kamu didapatkan +50000\n${users[m.sender].money += 50000} Money kamu\n\nPenghasilan dagang @${who.replace(/@.+/, '')} didapatkan +50000\n${users[who].money += 50000} Money @${who.replace(/@.+/, '')}`,{
    contextInfo: {
    mentionedJid: [m.sender, who]
    }})
            }, 21600000)
            setTimeout(() => {
                replyalya( `Selamat kamu dan @${who.replace(/@.+/, '')} mendapatkan money..\n\nPenghasilan dagang kamu didapatkan +50000\n${users[m.sender].money += 50000} Money kamu\n\nPenghasilan dagang @${who.replace(/@.+/, '')} didapatkan +50000\n${users[who].money += 50000} Money @${who.replace(/@.+/, '')}`,{
    contextInfo: {
    mentionedJid: [m.sender, who]
    }})
            }, 25200000)
            setTimeout(() => {
                replyalya( `Selamat kamu dan @${who.replace(/@.+/, '')} mendapatkan money..\n\nPenghasilan dagang kamu didapatkan +10000\n${users[m.sender].money += 10000} Money kamu\n\nPenghasilan dagang @${who.replace(/@.+/, '')} didapatkan +100000\n${users[who].money += 100000} Money @${who.replace(/@.+/, '')}`,{
    contextInfo: {
    mentionedJid: [m.sender, who]
    }})
            }, 28800000)
        } else replyalya(`Anda Sudah Berdagang , tunggu ${timers} lagi..`)

    }

  }
