// Plugin: buka
// Auto-generated from Alya V12
// Commands: buka

const path = require('path')

module.exports = {
  command: ["buka"],
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

        if (!global.db.users[m.sender]) global.db.users[m.sender] = {}
        let userAlt = global.db.users[m.sender]
        let typeAlt = args[0] ? args[0].toLowerCase() : ''
        let count = args[1] && !isNaN(args[1]) ? Math.max(parseInt(args[1]), 1) : 1

        let listCrate = ['common', 'uncommon', 'mythic', 'legendary']
        if (!listCrate.includes(type)) return reply(`🔍 Format salah! Gunakan: *${prefix}open [jenis] [jumlah]*\nContoh: *${prefix}open common 1*\n\nJenis peti yang tersedia:\n- common\n- uncommon\n- mythic\n- legendary`)

        if (user[type] < count) return reply(`❌ Kamu tidak memiliki cukup peti *${type}*! (Punya: ${user[type]})`)

        let totalMoney = 0
        let totalLimit = 0
        let totalExp = 0

        for (let i = 0; i < count; i++) {
            if (type === 'common') {
                totalMoney += Math.floor(Math.random() * 5000)
                totalLimit += Math.floor(Math.random() * 5)
                totalExp += Math.floor(Math.random() * 500)
            } else if (type === 'uncommon') {
                totalMoney += Math.floor(Math.random() * 20000)
                totalLimit += Math.floor(Math.random() * 15)
                totalExp += Math.floor(Math.random() * 2000)
            } else if (type === 'mythic') {
                totalMoney += Math.floor(Math.random() * 80000)
                totalLimit += Math.floor(Math.random() * 20)
                totalExp += Math.floor(Math.random() * 10000)
            } else if (type === 'legendary') {
                totalMoney += Math.floor(Math.random() * 200001)
                totalLimit += Math.floor(Math.random() * 50)
                totalExp += Math.floor(Math.random() * 50000)
            }
        }

        user[type] -= count
        user.money += totalMoney
        userAlt.limit += totalLimit
        userAlt.exp += totalExp

        let teks = `
    🎁 *HASIL BUKA PETI (${typeAlt.toUpperCase()})* 🎁

    Kamu telah membuka *${count}* peti dan mendapatkan:
    - 💰 *Uang:* Rp ${totalMoney.toLocaleString()}
    - 🎫 *Limit:* ${totalLimit}
    - 🛡️ *EXP:* ${totalExp.toLocaleString()}

    *Sisa peti kamu:* ${user[type]}
    `.trim()

        reply(teks)
    }
    //==================================================================
  }
