// Plugin: setlimit
// Auto-generated from Alya V12
// Commands: setlimit

const path = require('path')

module.exports = {
  command: ["setlimit"],
  tags: ['owner'],
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

      if (!target || !amount)
        return replyalya(
    `Format salah.

    Contoh:
    ${prefix}setlimit 50
    ${prefix}setlimit @tag 50
    ${prefix}setlimit 628xxxx 50
    ${prefix}setlimit unlimited`
        )

      if (!(target in global.db.users))
        return replyalya('User tidak ditemukan.')

      if (
        amount.toString().toLowerCase() === 'unlimited' ||
        amount.toString() === '-1'
      ) {
        unlimited = true
        global.db.users[target].limit = Infinity
      } else {
        amount = parseInt(amount)
        if (isNaN(amount) || amount < 0) return replyalya('Jumlah limit tidak valid')
        global.db.users[target].limit = amount
      }

      let limitText = unlimited ? 'Unlimited ♾️' : amount

      replyalya(
    `╭┈┈⬡「 🎟️ *SET LIMIT* 」
    ┃ 👤 User: @${target.split('@')[0]}
    ┃ 🎫 Limit: *${limitText}*
    ╰┈┈┈┈┈┈┈┈⬡`,
      { mentions: [target] }
      )
  }
}
