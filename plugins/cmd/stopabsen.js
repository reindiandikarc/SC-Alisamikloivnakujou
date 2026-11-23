// Plugin: stopabsen
// Auto-generated from Alya V12
// Commands: stopabsen

const path = require('path')

module.exports = {
  command: ["stopabsen"],
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
      if (!absenList[m.chat]) return replyalya('❌ Tidak ada sesi absen yang aktif di grup ini.');

      if (m.sender !== absenList[m.chat].creator) return replyalya('❌ Hanya pengguna yang memulai absen yang bisa menghentikan sesi ini.');

      delete absenList[m.chat];
      saveAbsen();

      return replyalya(`🛑 Sesi absen telah dihentikan oleh @${m.sender.split('@')[0]}`);
  }
}
