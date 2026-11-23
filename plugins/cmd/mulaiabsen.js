// Plugin: mulaiabsen
// Auto-generated from Alya V12
// Commands: mulaiabsen

const path = require('path')

module.exports = {
  command: ["mulaiabsen"],
  tags: ['ai'],
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

      if (!m.isGroup) return replytolak('❌ Fitur ini hanya bisa digunakan di dalam grup.');

      if (absenList[m.chat]) return replyalya('❌ Sesi absen sudah dimulai.');

      absenList[m.chat] = { mulai: true, list: [], creator: m.sender };
      saveAbsen();

      return replyalya('✅ Sesi absen dimulai! Ketik `.absen` untuk melakukan absen.');
  }
}
