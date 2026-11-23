// Plugin: koboy
// Auto-generated from Alya V12
// Commands: koboy

const path = require('path')

module.exports = {
  command: ["koboy"],
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
    function random(arr) {
      return arr[Math.floor(Math.random() * arr.length)]
    }
    	try {
      alya.tembak = alya.tembak || { musuh: [], tembak: [] }
       if(/kiri/i.test(text)) {

        let kiri = [
          ["🤠", "-", "-", "-", "-"],
          ["-", "🤠", "-", "-", "-"],
          ["-", "-", "🤠", "-", "-"],
          ["-", "-", "-", "🤠", "-"],
          ["-", "-", "-", "-", "🤠"]
        ]

        if(alya.tembak.tembak.indexOf("🤠") == 0) {
          alya.tembak.tembak = kiri[0]
        } else if(alya.tembak.tembak.indexOf("🤠") == 1) {
          alya.tembak.tembak = kiri[0]
        } else if(alya.tembak.tembak.indexOf("🤠") == 2) {
          alya.tembak.tembak = kiri[1]
        } else if(alya.tembak.tembak.indexOf("🤠") == 3) {
          alya.tembak.tembak = kiri[2]
        } else if(alya.tembak.tembak.indexOf("🤠") == 4) {
          alya.tembak.tembak = kiri[3]
        }

        let pos = alya.tembak.musuh.join(" ") + "\n\n\n" + alya.tembak.tembak.join(" ")



        if(alya.tembak.musuh.indexOf("🥷") === alya.tembak.tembak.indexOf("🤠")) return alya.sendButton(m.chat, pos, wm, [
                                                                                                  ['Tembak', `${command}koboy tembak`]
                                                                                                  ])
        return alya.sendButton(m.chat, pos, wm, [
              ['←', `${command}koboy kiri`], ['→', `${command}koboy kanan`]
    ])
      } else if(/kanan/i.test(text)) {

        let kanan = [
          ["🤠", "-", "-", "-", "-"],
          ["-", "🤠", "-", "-", "-"],
          ["-", "-", "🤠", "-", "-"],
          ["-", "-", "-", "🤠", "-"],
          ["-", "-", "-", "-", "🤠"]
        ]

        if(alya.tembak.tembak.indexOf("🤠") == 0) {
          alya.tembak.tembak = kanan[1]
        } else if(alya.tembak.tembak.indexOf("🤠") == 1) {
          alya.tembak.tembak = kanan[2]
        } else if(alya.tembak.tembak.indexOf("🤠") == 2) {
          alya.tembak.tembak = kanan[3]
        } else if(alya.tembak.tembak.indexOf("🤠") == 3) {
          alya.tembak.tembak = kanan[4]
        } else if(alya.tembak.tembak.indexOf("🤠") == 4) {
          alya.tembak.tembak = kanan[4]
        }

        let pos = alya.tembak.musuh.join(" ") + "\n\n\n" + alya.tembak.tembak.join(" ")



        if(alya.tembak.musuh.indexOf("🥷") === alya.tembak.tembak.indexOf("🤠")) return alya.sendButton(m.chat, pos, wm, [
                                                                                                  ['Tembak', `${command}koboy tembak`]
                                                                                                  ])
        return alya.sendButton(m.chat, pos, wm, [
              ['←', `${command}koboy kiri`], ['→', `${command}koboy kanan`]
    ])
      } else if(/tembak/i.test(text)) {

        if(alya.tembak.tembak.indexOf("🤠") == alya.tembak.musuh.indexOf("🥷")) {
          alya.tembak = {}
          global.db.users[m.sender].money += 1000
          m.reply("Kamu menang!\n\nUang += 1000")
        }

      } else {
       let randMusuh = [
          ["🥷", "-", "-", "-", "-"],
          ["-", "🥷", "-", "-", "-"],
          ["-", "-", "🥷", "-", "-"],
          ["-", "-", "-", "🥷", "-"],
          ["-", "-", "-", "-", "🥷"]
        ]
       let randAku = [
          ["🤠", "-", "-", "-", "-"],
          ["-", "🤠", "-", "-", "-"],
          ["-", "-", "🤠", "-", "-"],
          ["-", "-", "-", "🤠", "-"],
          ["-", "-", "-", "-", "🤠"]
        ]

        let musuh = random(randMusuh)
       let aku = random(randAku)

        alya.tembak.musuh = musuh
        alya.tembak.tembak = aku

        let pos = alya.tembak.musuh.join(" ") + "\n\n\n" + alya.tembak.tembak.join(" ")

        if(alya.tembak.musuh.indexOf("🥷") === alya.tembak.tembak.indexOf("🤠")) return alya.sendButton(m.chat, pos, wm, [
                                                                                                  ['Tembak', `${command}koboy tembak`]
                                                                                                  ])
        return alya.sendButton(m.chat, pos, wm, [
              ['←', `${command}koboy kiri`], ['→', `${command}koboy kanan`]
    ])
      }
      } catch (e) {
      	throw false
      }
    }
    //==================================================================
  }
