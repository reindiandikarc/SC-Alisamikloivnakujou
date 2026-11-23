// Plugin: bet
// Auto-generated from Alya V12
// Commands: bet

const path = require('path')

module.exports = {
  command: ["bet"],
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
      function number(x = 0) {
        x = parseInt(x)
        return !isNaN(x) && typeof x == 'number'
    }
    const items = [ 'money', 'chip' ]
        let userAlt = global.db.users[m.sender]
        let item = items.filter(v => v in user && typeof user[v] == 'number')
        let typeAlt = (args[0] || '').toLowerCase()
        let count = (args[1] && number(parseInt(args[1])) ? Math.max(parseInt(args[1]), 1): /all/i.test(args[1]) ? Math.floor(parseInt(user[type])): 1) * 1
        if (!item.includes(type)) return replyalya(`*List Item:*\n${item.map(v => `${global.rpg.emoticon(v)}${v}`.trim()).join('\n')}\n\nExample:\nbet money 100000`)
        if ((user[type] * 1) < count) return replyalya(`*${type} ${global.rpg.emoticon(type)}* kamu tidak cukup!!`)
        let moneyDulu = user[type] * 1
        let txt = (m.msg && m.msg.selectedDisplayText ? m.msg.selectedDisplayText: m.text ? m.text: '').toLowerCase()
        try {
            let Bot = (Math.ceil(Math.random() * 91)) * 1
            let Kamu = (Math.floor(Math.random() * 71)) * 1
            let status = 'Kalah'
            if (Bot < Kamu) {
                user[type] += count * 1
                status = 'Menang'
            } else if (Bot > Kamu) {
                user[type] -= count * 1
            } else {
                status = 'Seri'
                user[type] += (Math.floor(count / 1.5)) * 1
            }
            replyalya(`
    | *PLAYERS* | *POINT* |
    *🤖 BOT:*      ${Bot}
    *👤 KAMU:*    ${Kamu}

    Kamu *${status}*, kamu ${status == 'Menang' ? `Mendapatkan *+${count * 2}*`: status == 'Kalah' ? `Kehilangan *-${count * 1}*`: `Mendapatkan *+${Math.floor(count / 1.5)}*`} *${type} ${global.rpg.emoticon(type)}*
    `.trim())
        } catch (e) {
            if (moneyDulu > (user[type] * 1)) user[type] = moneyDulu * 1
            replyalya('Error saat melakukan judi (Rejected)')
        }
    }
    //==================================================================
  }
