// Plugin: casino
// Auto-generated from Alya V12
// Commands: casino

const path = require('path')

module.exports = {
  command: ["casino"],
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
    let buatall = 1
        alya.casino = alya.casino ? alya.casino : {}
        if (m.chat in alya.casino) return reply ('Masih ada yang melakukan casino disini, tunggu sampai selesai!!')
        else alya.casino[m.chat] = true
        try {
            let randomaku = `${Math.floor(Math.random() * 101)}`.trim()
            let randomkamu = `${Math.floor(Math.random() * 81)}`.trim() //hehe Biar Susah Menang :v
            let Aku = (randomaku * 1)
            let Kamu = (randomkamu * 1)
            let count = args[0]
            count = count ? /all/i.test(count) ? Math.floor(global.db.users[m.sender].exp / buatall) : parseInt(count) : args[0] ? parseInt(args[0]) : 1
            count = Math.max(1, count)
            if (args.length < 1) return reply('casino <jumlah>\n ' + 'casino 1000', )
            if (global.db.users[m.sender].exp >= count * 1) {
                global.db.users[m.sender].exp -= count * 1
                //await reply('') //Kwkwwkkwlwlw
                if (Aku > Kamu) {
                    reply(`💰 Casino 💰\n*Kamu:* ${Kamu} Point\n*Computer:* ${Aku} Point\n\n*You LOSE*\nKamu kehilangan ${count} Uang(xp)`)
                } else if (Aku < Kamu) {
                    global.db.users[m.sender].exp += count * 2
                    reply(`💰 Casino 💰\n*Kamu:* ${Kamu} Point\n*Computer:* ${Aku} Point\n\n*You Win*\nKamu mendapatkan ${count * 2} Uang(xp)`)
                } else {
                    global.db.users[m.sender].exp += count * 1
                    reply(`💰 Casino 💰\n*Kamu:* ${Kamu} Point\n*Computer:* ${Aku} Point\n\n*SERI*\nKamu mendapatkan ${count * 1} Uang(xp)`)
                }
            } else reply(`Uang(xp) kamu tidak mencukupi untuk Casino silahkan *#kerja* terlebih dahulu!`)
        } catch (e) {
            console.log(e)
            reply('Error!!')
            if (DevMode) {
                for (let jid of global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != alya.user.jid)) {
                    alya.sendMessage(jid, 'casino.js error\nNo: *' + m.sender.split`@`[0] + '*\nCommand: *' + m.text + '*\n\n*' + e + '*', MessageType.text)
                }
            }
        } finally {
            delete alya.casino[m.chat]
        }
    }
  }
