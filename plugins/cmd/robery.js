// Plugin: robery
// Auto-generated from Alya V12
// Commands: rob, robery

const path = require('path')

module.exports = {
  command: ["rob", "robery"],
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
        let userAlt = global.db.users[m.sender]
        let __timers = (new Date - (userAlt.lastmisi || 0))
        let _timers = (3600000 - __timers)
        let timers = clockString(_timers)
        let id = m.sender
        let kerja = 'Rob'
        alya.misi = alya.misi ? alya.misi : {}
        if (id in alya.misi) {
            reply( `Selesaikan Misi ${alya.misi[id][0]} Terlebih Dahulu`)
            throw false
        }
        if (userAlt.health < 80) return reply('Anda Harus Memiliki Minimal 80Health')
        if (new Date - global.db.users[m.sender].lastmisi > 3600000) {
            let rndm1 = Math.floor(Math.random() * 10)
            let rndm2 = Math.floor(Math.random() * 10)

            let ran1 = (rndm1 * 100000)
            let ran2 = (rndm2 * 1000)

            let jln = `
    🏘️          🚗

    ✔️ Mengincar target....
    `.trim()

            let jln2 = `
    🏘️     🚶

    ➕ Memulai aksi....
    `.trim()

            let jln3 = `
    🏘️

    ➕ Merampok....
    `.trim()

            let jln4 = `
    🚗



    🏘️🚓

    ➕ 💹Berhasil kabur....
    `.trim()

            let hsl = `
    *—[ Hasil rob ]—*

    ➕ 💹 Uang = [ ${ran1} ]
    ➕ ✨ Exp = [ ${ran2} ]
    ➕ 📦 Rob Selesai = +1

    Dan health anda berkurang -80
    `.trim()
            userAlt.money += ran1
            userAlt.exp += ran2
            userAlt.health -= 80

    		alya.misi[id] = [
            kerja,
            setTimeout(() => {
                delete alya.misi[id]
            }, 27000)
        	]

            setTimeout(() => {
                reply(hsl)
            }, 27000)

            setTimeout(() => {
                reply(jln4)
            }, 25000)

            setTimeout(() => {
                reply(jln3)
            }, 20000)

            setTimeout(() => {
                reply(jln2)
            }, 15000)

            setTimeout(() => {
                reply(jln)
            }, 10000)

            setTimeout(() => {
                reply('🔍Mencari Rumah.....')
            }, 0)
            userAlt.lastmisi = new Date * 1
        } else reply(`Silahkan Menunggu Selama ${timers}, Untuk Menyelesaikan Misi Kembali`)
        }
    //==================================================================
  }
