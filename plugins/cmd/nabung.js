// Plugin: nabung
// Auto-generated from Alya V12
// Commands: nabung

const path = require('path')

module.exports = {
  command: ["nabung"],
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

    const xpperlimit = 1
    	let userAlt = global.db.users[m.sender]
      let count = command.replace(/^nabung/i, '')
      count = count ? /all/i.test(count) ? Math.floor(global.db.users[m.sender].money / xpperlimit) : parseInt(count) : args[0] ? parseInt(args[0]) : 1
      count = Math.max(1, count)
      if (user.atm == 0) return reply('kamu belum mempuyai atm !')
      if (user.bank > user.fullatm) return reply('Uang dibankmu sudah penuh!')
      if (count > user.fullatm - user.bank) return reply('Uangnya ga muat dibank')
      if (global.db.users[m.sender].money >= xpperlimit * count) {
        global.db.users[m.sender].money -= xpperlimit * count
        global.db.users[m.sender].bank += count
        reply(`Sukses menabung sebesar ${count} Money 💹`)
      } else reply(`[❗] Uang anda tidak mencukupi untuk menabung ${count} money 💹`)
  }
}
