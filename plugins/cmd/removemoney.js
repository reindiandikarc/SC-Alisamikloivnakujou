// Plugin: removemoney
// Auto-generated from Alya V12
// Commands: hapusmoney, removemoney

const path = require('path')

module.exports = {
  command: ["hapusmoney", "removemoney"],
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
      if (!Ryuu) return replyalya(mess.only.owner)

      const rupiah = (n) => {
        n = Number(n) || 0
        const sign = n < 0 ? '-' : ''
        const s = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        return `${sign}${s}`
      }

      const getTargetJid = () => {
        if (m.quoted && m.quoted.sender) return m.quoted.sender
        return m.sender
      }

      const parseTarget = () => {
        if (args.length === 1) {
          return { jid: getTargetJid(), amount: args[0] }
        }
        if (args.length >= 2) {
          const maybeNumber = String(args[0]).replace(/[^0-9]/g, '')
          if (maybeNumber.length >= 8) {
            return { jid: maybeNumber + '@s.whatsapp.net', amount: args[1] }
          }
          return { jid: getTargetJid(), amount: args[0] }
        }
        return { jid: null, amount: null }
      }

      const parsed = parseTarget()
      let target = parsed.jid
      let amount = parsed.amount

      if (!amount) {
        return replyalya(
    `Contoh:
    ${prefix}delmoney 10000
    ${prefix}delmoney 62812xxxxx 10000`.trim()
        )
      }

      amount = parseInt(amount)
      if (isNaN(amount) || amount <= 0) return replyalya('Jumlah money tidak valid')

      if (!target) return replyalya('Target tidak valid')
      if (!(target in global.db.users)) return replyalya(`User ${target.split('@')[0]} tidak ada di database`)

      let userAlt = global.db.users[target]
      userAlt.money = Number(userAlt.money || 0)

      const beforeMoney = userAlt.money
      const removed = Math.min(userAlt.money, amount)
      userAlt.money -= removed

      const nomor = target.split('@')[0]
      const nameTarget = (user?.registered && user?.name)
        ? userAlt.name
        : (alya.getName(target) ? alya.getName(target) : nomor)

      let msg =
    `╭┈┈⬡「 🗑️ *DELETE MONEY* 」
    ┃ 👤 Target: *${nameTarget}* (${nomor})
    ┃ ➖ Removed: *Rp ${rupiah(removed)}*
    ┃ 💰 Money: *Rp ${rupiah(beforeMoney)}* ➜ *Rp ${rupiah(userAlt.money)}*
    ╰┈┈┈┈┈┈┈┈⬡`.trim()

      replyalya(msg)
  }
}
