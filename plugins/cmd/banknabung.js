// Plugin: banknabung
// Auto-generated from Alya V12
// Commands: banknabung

const path = require('path')

module.exports = {
  command: ["banknabung"],
  tags: ['admin'],
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
    const xpperlimit = 1
      let userAlt = global.db.users[m.sender]
      let all = command.replace(/^tarik/i, '')
      let count = all ? all : args[0]
      count = count ? /all/i.test(count) ? Math.floor(user.money / xpperlimit) : parseInt(count) : args[0] ? parseInt(args[0]) : 1
      count = Math.max(1, count)
      if (user.atm == 0) return replyalya('kamu belum mempunyai kartu ATM')
      if (user.bank > user.fullatm) return replyalya('Uang Di ATM sudah penuh!')
      if (count > user.fullatm - user.bank) return m.reply('Uangnya nya sudah mencapai batas')
      if (user.money >= xpperlimit * count) {
        user.money -= xpperlimit * count
        user.bank += count
        replyalya(`Sukses menabung sebesar ${count} Money 💹`)
      } else replyalya(`[❗] Uang anda tidak mencukupi untuk menabung ${count} money 💹`, )
    }
    //==================================================================
  }
