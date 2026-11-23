// Plugin: slot1
// Ported from Alya V12 - Fixed for V13
// Commands: slot1

const path = require('path')

module.exports = {
  command: ["slot1"],
  tags: ['game'],
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

    alya.slots = alya.slots || {}
    if (m.chat in alya.slots) return replyalya('Masih ada yang bermain slot disini, tunggu sampai selesai!!')
    alya.slots[m.chat] = true

    const delay = (ms) => new Promise(res => setTimeout(res, ms))
    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]
    const SYMBOLS = ['🦁', '🐼', '🐷', '🐮', '🦊']

    try {
      let count = parseInt(args[0])
      if (!count || count < 1) return replyalya(`Gunakan format *${prefix}${command} [jumlah]*\nContoh *${prefix}${command} 10*`)

      let userAlt = global.db.users[m.sender]
      userAlt.money ??= 0

      if (userAlt.money < count) return replyalya(`💸 Money tidak cukup. Kamu punya: ${userAlt.money.toLocaleString()}`)

      userAlt.money -= count

      const randRow = () => `${pickRandom(SYMBOLS)}|${pickRandom(SYMBOLS)}|${pickRandom(SYMBOLS)}`

      const sentMsg = await alya.sendMessage(m.chat, {
        text: `*🎰 VIRTUAL SLOT 🎰*\n\n${randRow()}\n${randRow()} <<==\n${randRow()}\n\n⏳ Memutar mesin...`
      }, { quoted: m })

      for (let i = 0; i < 3; i++) {
        await delay(2000)
        await alya.sendMessage(m.chat, {
          text: `*🎰 VIRTUAL SLOT 🎰*\n\n${randRow()}\n${randRow()} <<==\n${randRow()}\n\n⏳ Memutar mesin...`,
          edit: sentMsg.key
        })
      }

      // Final spin
      const spin = Array.from({ length: 9 }, () => pickRandom(SYMBOLS))
      const [s1,s2,s3,s4,s5,s6,s7,s8,s9] = spin

      let winOrLose, hadiah
      if (spin.every(v => v === spin[0])) {
        winOrLose = 'JACKPOT BESAR 🎉🎉'
        hadiah = count * 4
        userAlt.money += hadiah
      } else if (s4 === s5 && s5 === s6) {
        winOrLose = 'JACKPOT 🎉'
        hadiah = count * 2
        userAlt.money += hadiah
      } else if ((s1 === s2 && s2 === s3) || (s7 === s8 && s8 === s9)) {
        winOrLose = 'Sedikit Lagi!!'
        hadiah = -count
      } else {
        winOrLose = 'Kamu Kalah'
        hadiah = -count
      }

      await delay(2000)
      await alya.sendMessage(m.chat, {
        text: `*🎰 VIRTUAL SLOT 🎰*\n\n${s1}|${s2}|${s3}\n${s4}|${s5}|${s6} <<==\n${s7}|${s8}|${s9}\n\n*${winOrLose}*\n${hadiah > 0 ? `+${hadiah.toLocaleString()}` : `${hadiah.toLocaleString()}`} money`,
        edit: sentMsg.key
      })

    } catch (e) {
      console.error(e)
      replyalya('❌ Error slot')
    } finally {
      delete alya.slots[m.chat]
    }
  }
}
