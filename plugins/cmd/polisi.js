// Plugin: polisi
// Auto-generated from Alya V12
// Commands: polisi

const path = require('path')

module.exports = {
  command: ["polisi"],
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
        let __timers = (new Date - global.db.users[m.sender].lastmisi)
        let _timers = (3600000 - __timers)
        let order = global.db.users[m.sender].ojekk
        let timers = clockString(_timers)
        let name = alya.getName(m.sender)
        let userAlt = global.db.users[m.sender]
        let id = m.sender
        let kerja = 'Polisi'
        alya.misi = alya.misi ? alya.misi: {}
        if (id in alya.misi) {
            replyalya(`Selesaikan Misi ${alya.misi[id][0]} Terlebih Dahulu`)
            throw false
        }
        if (new Date - global.db.users[m.sender].lastmisi > 3600000) {
            let randomaku1 = Math.floor(Math.random() * 10)
            let randomaku2 = Math.floor(Math.random() * 10)

            let rbrb1 = (randomaku1 * 100000)
            let rbrb2 = (randomaku2 * 1000)

            var dimas = `
    👮Mengejar Pencuri....
    `.trim()

            var dimas2 = `
    👮Menangkap pencuri....
    `.trim()

            var dimas3 = `
    🚔Membawa ke kantor polisi\nDan di penjara
    `.trim()

            var dimas4 = `
    ➕ 💹Menerima gaji....
    `.trim()

            var hsl = `
    *—[ Hasil Polisi ${name} ]—*
    ➕ 💹 Uang = [ ${rbrb1} ]
    ➕ ✨ Exp = [ ${rbrb2} ]
    ➕ 😍 Order Selesai = +1
    ➕ 📥Total Order Sebelumnya : ${order}
    `.trim()

            user.money += rbrb1
            userAlt.exp += rbrb2
            user.ojekk += 1

            alya.misi[id] = [
                kerja,
                setTimeout(() => {
    delete alya.misi[id]
                }, 27000)
            ]

            setTimeout(() => {
                replyalya(`${hsl}`)
            }, 27000)

            setTimeout(() => {
                replyalya(`${dimas4}`)
            }, 25000)

            setTimeout(() => {
                replyalya(`${dimas3}`)
            }, 20000)

            setTimeout(() => {
               replyalya(`${dimas2}`)
            }, 15000)

            setTimeout(() => {
                replyalya(`${dimas}`)
            }, 10000)

            setTimeout(() => {
                replyalya('??Sedang Berpatroli.....')
            }, 0)
            user.lastmisi = new Date * 1
        } else replyalya(`Silahkan Menunggu Selama ${timers}, Untuk Menyelesaikan Misi Kembali`)
    }
    // let pajak = 0.02
  }
