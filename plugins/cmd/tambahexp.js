// Plugin: tambahexp
// Auto-generated from Alya V12
// Commands: tambahxp, tambahexp

const path = require('path')

module.exports = {
  command: ["tambahxp", "tambahexp"],
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

      const expNeed = (lvl = 0) => Math.floor(20000 * Math.pow(1.25, Number(lvl || 0)))

      const addExpAndLevelUp = (user, amount = 0) => {
        amount = Number(amount || 0)
        userAlt.level = Number(userAlt.level || 0)
        userAlt.exp = Number(userAlt.exp || 0)

        if (amount > 0) userAlt.exp += amount

        let leveledUp = 0
        let need = expNeed(userAlt.level)

        while (userAlt.exp >= need) {
          userAlt.exp -= need
          userAlt.level += 1
          leveledUp += 1
          need = expNeed(userAlt.level)
        }

        return { leveledUp, level: userAlt.level, exp: userAlt.exp, next: need }
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
    ${prefix}addexp 5000
    ${prefix}addexp 62812xxxxx 5000`.trim()
        )
      }

      amount = parseInt(amount)
      if (isNaN(amount) || amount <= 0) return replyalya('Jumlah EXP tidak valid')

      if (!target) return replyalya('Target tidak valid')
      if (!(target in global.db.users)) return replyalya(`User ${target.split('@')[0]} tidak ada di database`)

      let userAlt = global.db.users[target]

      const beforeLevel = Number(userAlt.level || 0)
      const beforeExp = Number(userAlt.exp || 0)

      const r = addExpAndLevelUp(user, amount)

      const nomor = target.split('@')[0]
      const nameTarget = (user?.registered && user?.name)
        ? userAlt.name
        : (alya.getName(target) ? alya.getName(target) : nomor)

      let msg =
    `╭┈┈⬡「 ✨ *ADD EXP* 」
    ┃ 👤 Target: *${nameTarget}* (${nomor})
    ┃ ➕ Added: *${rupiah(amount)} EXP*
    ┃ 📊 Level: *${beforeLevel}* ➜ *${r.level}*
    ┃ 🚄 Exp: *${rupiah(beforeExp)}* ➜ *${rupiah(r.exp)}* / *${rupiah(r.next)}*
    ┃ 🎉 Level Up: *${r.leveledUp > 0 ? r.leveledUp + 'x' : '0'}*
    ╰┈┈┈┈┈┈┈┈⬡`.trim()

      replyalya(msg)
  }
}
