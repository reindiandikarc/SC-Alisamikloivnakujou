// Plugin: setmoney
// Auto-generated from Alya V12
// Commands: setmoney

const path = require('path')

module.exports = {
  command: ["setmoney"],
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

      if (!Ryuu) return replyalya(mess.only.owner)

      let target
      let amount
      let unlimited = false

      if (m.quoted) {
        target = m.quoted.sender
        amount = args[0]
      } else if (args.length >= 2) {
        target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        amount = args[1]
      } else {
        target = m.sender
        amount = args[0]
      }

      if (!target || !amount) {
        return replyalya(
    `Format salah.

    Contoh:
    ${prefix}setmoney 5000
    ${prefix}setmoney @tag 5000
    ${prefix}setmoney 628xxxx 5000
    ${prefix}setmoney unlimited`
        )
      }

      if (!(target in global.db.users)) {
        return replyalya('User tidak ditemukan.')
      }

      if (
        amount.toString().toLowerCase() === 'unlimited' ||
        amount.toString() === '-1'
      ) {
        unlimited = true
        global.db.users[target].money = Infinity
      } else {
        amount = parseInt(amount)
        if (isNaN(amount) || amount < 0) {
          return replyalya('Jumlah money tidak valid')
        }

        global.db.users[target].money = amount
      }

      let moneyText = unlimited
        ? 'Unlimited ♾️'
        : `Rp ${amount.toLocaleString('id-ID')}`

      replyalya(
    `╭┈┈⬡「 💰 *SET MONEY* 」
    ┃ 👤 User: @${target.split('@')[0]}
    ┃ 💵 Money: *${moneyText}*
    ╰┈┈┈┈┈┈┈┈⬡`,
      { mentions: [target] }
      )
  }
}
