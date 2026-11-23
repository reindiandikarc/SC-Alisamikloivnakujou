// Plugin: berkebon
// Auto-generated from Alya V12
// Commands: berkebon

const path = require('path')

module.exports = {
  command: ["berkebon"],
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
    const timeout = 1800000
        let __timers = (new Date - global.db.users[m.sender].lastberkebon)
        let _timers = (timeout - __timers)
        let timers = clockString(_timers)
        let userAlt = global.db.users[m.sender]
        let { stock } = global.db.settings[botNumber]
        let pisang = 100 - user.bibitpisang
        let anggur = 100 - user.bibitanggur
        let mangga = 100 - user.bibitmangga
        let jeruk = 100 - user.bibitjeruk
        let apel = 100 - user.bibitapel
        let kerja = 'Berkebun'
        let id = m.chat
        .misi = alya.misi ? alya.misi : {}
        if (id in alya.misi) {
            replyalya(`Selesaikan Misi ${alya.misi[id][0]} Terlebih Dahulu`)
            return false
        }
        let caption = `
    📮 Kamu Membutuhkan Bibit:\n${user.bibitpisang < 100 ? `\n${global.rpg.emoticon('bibitpisang')} BibitPisang: ${pisang}`: ''} ${user.bibitanggur < 100 ? `\n${global.rpg.emoticon('bibitanggur')} BibitAnggur: ${anggur}`: ''} ${user.bibitmangga < 100 ? `\n${global.rpg.emoticon('bibitmangga')} BibitMangga: ${mangga}`: ''} ${user.bibitjeruk < 100 ? `\n${global.rpg.emoticon('bibitjeruk')} BibitJeruk: ${jeruk}`: ''} ${user.bibitapel < 100 ? `\n${global.rpg.emoticon('bibitapel')} BibitApel: ${apel}`: ''}`.trim()
        if (new Date - user.lastberkebon > 1800000) {
            if (user.bibitpisang >= 100 && user.bibitanggur >= 100 && user.bibitmangga >= 100 && user.bibitapel >= 100 && user.bibitjeruk >= 100) {
                let hasil1 = Math.floor(Math.random() * 100)
                let hasil2 = Math.floor(Math.random() * 100)
                let hasil3 = Math.floor(Math.random() * 100)
                let hasil4 = Math.floor(Math.random() * 100)
                let hasil5 = Math.floor(Math.random() * 100)

                let caption = `⌛ Hasil Panen Kamu

    ${global.rpg.emoticon('pisang')} Pisang: ${hasil1}
    ${global.rpg.emoticon('anggur')} Anggur ${hasil2}
    ${global.rpg.emoticon('mangga')} Mangga: ${hasil3}
    ${global.rpg.emoticon('jeruk')} Jeruk: ${hasil4}
    ${global.rpg.emoticon('apel')} Apel: ${hasil5}
    `
                user.pisang += hasil1
                user.anggur += hasil2
                user.mangga += hasil3
                user.jeruk += hasil4
                user.apel += hasil5

                user.bibitpisang -= 100
                user.bibitanggur -= 100
                user.bibitmangga -= 100
                user.bibitjeruk -= 100
                user.bibitapel -= 100

                stock.bibitpisang += 100
                stock.bibitanggur += 100
                stock.bibitmangga += 100
                stock.bibitjeruk += 100
                stock.bibitapel += 100


                alya.misi[id] = [
    kerja,
    setTimeout(() => {
    delete alya.misi[id]
    }, 20000)
                ]

                setTimeout(() => {
    replyalya(`${caption.trim()}`)
                }, 20000)

                setTimeout(() => {
    replyalya('Sedang Menanam Bibit...')
                }, 0)
                user.lastberkebon = new Date * 1
            } else replyalya(`${caption}`)
        } else replyalya(`Mohon Menunggu Selama ${timers} Untuk Berkebun Kembali...`)
    }
    //==================================================================
  }
