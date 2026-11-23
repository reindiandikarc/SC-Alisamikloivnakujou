// Plugin: slot
// Auto-generated from Alya V12
// Commands: slot

const path = require('path')

module.exports = {
  command: ["slot"],
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

      let u = global.db.users[m.sender]
      let bet = parseInt(args[0])

      alya.slots = alya.slots || {}
      if (alya.slots[m.chat])
        return replyalya('🎰 Slot sedang dipakai, tunggu dulu!')
      alya.slots[m.chat] = true

      try {
        if (!bet || bet < 100000)
          return replyalya('❌ Minimal taruhan 100.000')

        if (u.money < bet)
          return replyalya('💸 Money tidak cukup')

        const simbol = ['🦁','🐼','🐷','🐮','🦊']
        const rand = () => simbol[Math.floor(Math.random() * simbol.length)]

        u.money -= bet

        const sentMsg = await alya.sendMessage(
          m.chat,
          {
            text: `
    🎰 *VIRTUAL SLOT*
    ⬛|⬛|⬛
    ⬛|⬛|⬛ <<==
    ⬛|⬛|⬛

    ⏳ Memutar mesin...
    `
          },
          { quoted: m }
        )
        for (let i = 0; i < 4; i++) {
          await sleep(6000)
          await alya.sendMessage(m.chat, {
            text: `
    🎰 *VIRTUAL SLOT*
    ${rand()}|${rand()}|${rand()}
    ${rand()}|${rand()}|${rand()} <<==
    ${rand()}|${rand()}|${rand()}

    ⏳ Memutar mesin...
    `,
            edit: sentMsg.key
          })
        }

        let spin = Array.from({ length: 9 }, () => rand())

        let win = 0
        let status = '❌ KALAH'

        if (spin.every(v => v === spin[0])) {
          win = bet * 5
          status = '💎 JACKPOT BESAR'
        } else if (spin[3] === spin[4] && spin[4] === spin[5]) {
          win = bet * 2
          status = '🎉 JACKPOT'
        } else if (
          (spin[0] === spin[1] && spin[1] === spin[2]) ||
          (spin[6] === spin[7] && spin[7] === spin[8])
        ) {
          status = '😬 DIKIT LAGI'
        }

        u.money += win

        await sleep(6000)
        await alya.sendMessage(m.chat, {
          text: `
    🎰 *VIRTUAL SLOT*
    ${spin[0]}|${spin[1]}|${spin[2]}
    ${spin[3]}|${spin[4]}|${spin[5]} <<==
    ${spin[6]}|${spin[7]}|${spin[8]}

    *${status}*
    ${win ? `💰 +${win.toLocaleString()}` : `💸 -${bet.toLocaleString()}`}
    `,
          edit: sentMsg.key
        })

      } catch (e) {
        console.log(e)
        replyalya('❌ Error slot')
      } finally {
        delete alya.slots[m.chat]
      }
  }
}
