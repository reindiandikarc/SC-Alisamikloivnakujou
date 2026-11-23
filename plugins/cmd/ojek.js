// Plugin: ojek
// Auto-generated from Alya V12
// Commands: ojek

const path = require('path')

module.exports = {
  command: ["ojek"],
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
        return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
    }
        let __timers = (new Date - global.db.users[m.sender].lastmisi)
        let _timers = (3600000 - __timers)
        let order = global.db.users[m.sender].ojekk
        let timers = clockString(_timers)
        let name = alya.getName(m.sender)
        let userAlt = global.db.users[m.sender]
        let id = m.sender
        let kerja = 'Ojek'
        alya.misi = alya.misi ? alya.misi: {}
        if (id in alya.misi) {
            reply( `Selesaikan Misi ${alya.misi[id][0]} Terlebih Dahulu`)
            throw false
        }
        if (new Date - global.db.users[m.sender].lastmisi > 3600000) {
            let randomaku4 = Math.floor(Math.random() * 10)
            let randomaku5 = Math.floor(Math.random() * 10)

            let rbrb4 = (randomaku4 * 100000)
            let rbrb5 = (randomaku5 * 1000)

            var dimas = `
    🚶⬛⬛⬛⬛⬛⬛⬛⬛⬛
    ⬛⬜⬜⬜⬛⬜⬜⬜⬛⬛
    ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
    🏘️🏘️🏘️🏘️🌳  🌳 🏘️       🛵
    ✔️ Mendapatkan orderan....
    `.trim()

            var dimas2 = `
    🚶🛵⬛⬛⬛⬛⬛⬛⬛⬛
    ⬛⬜⬜⬜⬛⬜⬜⬜⬛⬛
    ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
    🏘️🏘️🏘️🏘️🌳  🌳 🏘️
    ➕ Mengantar ke tujuan....
    `.trim()

            var dimas3 = `
    ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
    ⬛⬜⬜⬛⬛⬜⬜⬜⬛⬛
    ⬛⬛⬛⬛⬛⬛⬛🛵⬛⬛
    🏘️🏘️🏘️🏘️🌳  🌳 🏘️
    ➕ Sampai di tujuan....
    `.trim()

            var dimas4 = `
    ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
    ⬛⬜⬜⬛⬛⬜⬜⬜⬛⬛
    ⬛⬛⬛⬛⬛⬛⬛🛵⬛⬛
    🏘️🏘️🏘️🏘️🌳  🌳 🏘️ 🚶
    ➕ 💹Menerima gaji....
    `.trim()

            var hsl = `
    *—[ Hasil Ngojek ${name} ]—*
    ➕ 💹 Uang = [ ${rbrb4} ]
    ➕ ✨ Exp = [ ${rbrb5} ]
    ➕ 😍 Order Selesai = +1
    ➕ 📥Total Order Sebelumnya : ${order}
    `.trim()

            user.money += rbrb4
            userAlt.exp += rbrb5
            user.ojekk += 1

    		alya.misi[id] = [
                kerja,
                setTimeout(() => {
                    delete alya.misi[id]
                }, 27000)
            ]

            setTimeout(() => {
                m.reply(hsl)
            }, 27000)

            setTimeout(() => {
                m.reply(dimas4)
            }, 25000)

            setTimeout(() => {
                m.reply(dimas3)
            }, 20000)

            setTimeout(() => {
                m.reply(dimas2)
            }, 15000)

            setTimeout(() => {
                m.reply(dimas)
            }, 10000)

            setTimeout(() => {
                m.reply('🔍Mencari pelanggan.....')
            }, 0)
            user.lastmisi = new Date * 1
        } else m.reply(`Silahkan Menunggu Selama ${timers}, Untuk Menyelesaikan Misi Kembali`)
  }
}
