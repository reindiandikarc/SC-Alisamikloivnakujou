// Plugin: delsetproses
// Auto-generated from Alya V12
// Commands: delsetproses

const path = require('path')

module.exports = {
  command: ["delsetproses"],
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

    if (!m.isGroup) return replytolak('Fitur Khusus Group!')
    if (!isAdmins) return replytolak('Fitur Khusus admin!')
    if (!isSetProses(m.chat, set_proses)) return reply(`Belum ada set proses di gc ini`)
    removeSetProses(m.chat, set_proses)
    reply(`Sukses delete set proses`)
  }
}
