// Plugin: absen
// Auto-generated from Alya V12
// Commands: absen

const path = require('path')

module.exports = {
  command: ["absen"],
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

      if (!m.isGroup) return replytolak('❌ Fitur ini hanya bisa digunakan di dalam grup.');
      if (!absenList[m.chat]?.mulai) return replyalya('❌ Absen belum dimulai.');

      // sender sudah di-destructure dari ctx
      if (absenList[m.chat].list.includes(sender)) return replyalya('❌ Kamu sudah absen.');

      absenList[m.chat].list.push(sender);
      saveAbsen();

      return replyalya(`✅ Absen berhasil! Total absen: ${absenList[m.chat].list.length}`);
  }
}
