// Plugin: roket
// Auto-generated from Alya V12
// Commands: roket

const path = require('path')

module.exports = {
  command: ["roket"],
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
        let userAlt = global.db.users[m.sender]
        let order = global.db.users[m.sender].rokets
        let timers = clockString(_timers)
        let name = user.registered ? userAlt.name: alya.getName(m.sender)
        let id = m.sender
        let kerja = 'Roket'
        alya.misi = alya.misi ? alya.misi: {}
        if (id in alya.misi) {
            reply( `Selesaikan Misi ${alya.misi[id][0]} Terlebih Dahulu`)
            throw false
        }
        if (user.health < 80) return m.reply(`Anda Harus Memiliki Minimal 80Health`)
        if (new Date - global.db.users[m.sender].lastmisi > 3600000) {
            let ngerok4 = Math.floor(Math.random() * 10)
            let ngerok5 = Math.floor(Math.random() * 10)

            let ngrk4 = (ngerok4 * 100000)
            let ngrk5 = (ngerok5 * 1000)

            let rokit = `🌕


    ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
    ▒▒▄▄▄▒▒▒█▒▒▒▒▄▒▒▒▒▒▒▒▒
    ▒█▀█▀█▒█▀█▒▒█▀█▒▄███▄▒
    ░█▀█▀█░█▀██░█▀█░█▄█▄█░
    ░█▀█▀█░█▀████▀█░█▄█▄█░
    ████████▀█████████████
    🚀

    👨‍🚀 Memulai penerbangan....
    `.trim()

            let rokit2 = `🌕


    🚀
    ▒▒▄▄▄▒▒▒█▒▒▒▒▄▒▒▒▒▒▒▒▒
    ▒█▀█▀█▒█▀█▒▒█▀█▒▄███▄▒
    ░█▀█▀█░█▀██░█▀█░█▄█▄█░
    ░█▀█▀█░█▀████▀█░█▄█▄█░
    ████████▀█████████████

    ➕ Dalam penerbangan....
    `.trim()

            let rokit3 = `🌕🚀


    ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
    ▒▒▄▄▄▒▒▒█▒▒▒▒▄▒▒▒▒▒▒▒▒
    ▒█▀█▀█▒█▀█▒▒█▀█▒▄███▄▒
    ░█▀█▀█░█▀██░█▀█░█▄█▄█░
    ░█▀█▀█░█▀████▀█░█▄█▄█░
    ████████▀█████████████

    ➕ Sampai di tujuan....
    `.trim()

            let rokit4 = `🌕🚀

    ➕ Sukses Mendarat.... 👨‍🚀
    `.trim()

            let hsl = `
    *—[ Hasil Ngroket ${name} ]—*
    ➕ 💹 Uang = [ ${ngrk4} ]
    ➕ ✨ Exp = [ ${ngrk5} ]
    ➕ 😍 Mendarat Selesai = +1
    ➕  📥Total Mendarat Sebelumnya : ${order}
    `.trim()

            user.money += ngrk4
            userAlt.exp += ngrk5
            user.rokets += 1
            user.health -= 80

    		alya.misi[id] = [
                kerja,
                setTimeout(() => {
                    delete alya.misi[id]
                }, 27000)
            ]

            setTimeout(() => {
                reply( hsl)
            }, 27000)

            setTimeout(() => {
                reply( rokit4)
            }, 25000)

            setTimeout(() => {
                reply( rokit3)
            }, 20000)

            setTimeout(() => {
                reply( rokit2)
            }, 15000)

            setTimeout(() => {
                reply( rokit)
            }, 10000)

            setTimeout(() => {
                reply( `🔍 ${name} Mencari Lokasi.....`)
            }, 0)
            user.lastmisi = new Date * 1
        } else m.reply(`Silahkan Menunggu Selama ${timers}, Untuk Menyelesaikan Misi Kembali`)
        }
    //==================================================================
  }
