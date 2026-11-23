// Plugin: setbotbio
// Fixed for Alya V13
// Commands: setbotbio

const path = require('path')

module.exports = {
  command: ["setbotbio"],
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

    if (!Ryuu) return replytolak(mess.only.owner)
    if (!text) return replyalya(`Dimana teksnya?\nContoh: ${prefix + command} Bio bot keren`)
    await alya.updateProfileStatus(text)
    replyalya(`✅ *Berhasil mengubah bio bot!*\n\n📝 Bio baru: _${text}_`)
  }
}
