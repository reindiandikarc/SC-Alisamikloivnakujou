// Plugin: totalcommand
// Auto-generated from Alya V12
// Commands: totalcmd, totalcommand

const path = require('path')

module.exports = {
  command: ["totalcmd", "totalcommand"],
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

        replyalya(`┌──⭓ *${botname} Total Fitur* ⭓──┐
    │
    │ 👤 Pengguna: *${pushname}*
    │ 💡 Total Fitur: *${alyaFitur()}* Command
    │ 💖 Dukunganmu sangat berarti!
    │ 🚀 Yuk bantu support dan donasi ✨
    │ agar fitur terus bertambah~ 🙌
    │
    └────⭓ Terimakasih 🔥`)
  }
}
