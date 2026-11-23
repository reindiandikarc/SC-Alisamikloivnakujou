// Plugin: bonus
// Auto-generated from Alya V12
// Commands: bonus

const path = require('path')

module.exports = {
  command: ["bonus"],
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
        var seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

        hours = (hours < 10) ? "0" + hours : hours
        minutes = (minutes < 10) ? "0" + minutes : minutes
        seconds = (seconds < 10) ? "0" + seconds : seconds

        return `${hours} jam ${minutes} menit ${seconds} detik`
      }

      let userAlt = global.db.users[m.sender]
      let time = user.lastbonus + 86400000

      if (new Date - user.lastbonus < 86400000) {
        return replyalya(`
    ╭━━━〔 🎁 *BONUS HARIAN* 〕━━⬣
    ┃
    ┃ ❌ *Hush! Jangan Serakah!* 💢
    ┃
    ┃ Kamu udah ambil bonusnya tadi! 🙄
    ┃ Tunggu sampe aku istirahat dulu:
    ┃ ⏳ ${msToTime(time - new Date())}
    ┃
    ┃ Balik lagi nanti kalau udah waktunya!
    ╰━━━━━━━━━━━━━━━━⬣`)
      }

      let money = Math.floor(Math.random() * (500000 - 100000 + 1)) + 100000
      let limit = Math.floor(Math.random() * (10 - 3 + 1)) + 3

      user.money += money
      userAlt.limit += limit
      user.lastbonus = new Date * 1

      replyalya(`
    ╭━━━〔 🎁 *BONUS HARIAN* 〕━━⬣
    ┃
    ┃ 🎉 *Tuh, Ambil Nih!* 😤
    ┃
    ┃ 💰 Uang Jajan :
    ┃ +Rp ${money.toLocaleString()}
    ┃
    ┃ ⚡ Limit :
    ┃ +${limit}
    ┃
    ┃ 📦 Udah aku masukin ke akunmu.
    ┃ Jangan dipake buat yang aneh-aneh,
    ┃ awas aja kalau boros! 💢
    ┃
    ╰━━━━━━━━━━━━━━━━⬣`)
    }
    //==================================================================
  }
