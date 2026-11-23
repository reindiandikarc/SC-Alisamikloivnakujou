// Plugin: blackinvest
// Auto-generated from Alya V12
// Commands: blackinvest

const path = require('path')

module.exports = {
  command: ["blackinvest"],
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
      let amount = parseInt(args[0])
      const cd = 12 * 60 * 60 * 1000

      if (!amount || amount < 20_000_000)
        return replyalya('❌ Minimal 20 juta')

      if (u.money < amount)
        return replyalya('💸 Money kurang')

      if (Date.now() - u.lastmaling < cd)
        return replyalya('⏳ Black market cooldown')

      u.money -= amount
      u.lastmaling = Date.now()

      let roll = Math.random()

      if (roll < 0.5) {
        replyalya(`
    🚨 *BLACK MARKET GAGAL*
    💸 Uang disita semua!
    `)
        return
      }

      if (roll < 0.7) {
        u.bannedTime = Date.now() + 10 * 60 * 1000
        replyalya(`
    🚓 *RAZIA POLISI*
    ⛔ Kau dipenjara 10 menit
    `)
        return
      }

      let hasil = Math.floor(amount * (2 + Math.random() * 2))
      u.bank += hasil

      replyalya(`
    🔥 *BLACK MARKET SUKSES*
    💸 Modal: ${amount.toLocaleString()}
    💰 Hasil: ${hasil.toLocaleString()}
    🏦 Masuk Bank
    `)
  }
}
