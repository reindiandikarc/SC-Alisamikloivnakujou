// Plugin: kriminal
// Auto-generated from Alya V12
// Commands: kriminal

const path = require('path')

module.exports = {
  command: ["kriminal"],
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
      if (!u || !u.kriminalLog?.length)
        return replyalya('📭 Kamu belum punya catatan kriminal')

      let txt = '*🧾 RIWAYAT BEGAL*\n\n'
      u.kriminalLog.slice(-5).forEach((v, i) => {
        txt += `${i + 1}. ${new Date(v.time).toLocaleString()}\n`
        txt += `🎯 Target: ${v.target}\n`
        txt += `📌 Hasil: ${v.hasil}\n\n`
      })

      replyalya(txt)
  }
}
