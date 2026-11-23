// Plugin: listabsen
// Auto-generated from Alya V12
// Commands: listabsen

const path = require('path')

module.exports = {
  command: ["listabsen"],
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

      const daftar = absenList[m.chat].list
        .map((jid, i) => `${i + 1}. @${jid.split('@')[0]}`)
        .join('\n') || 'Belum ada yang absen.';

      return alya.sendMessage(m.chat, {
        text: `📋 *Daftar Absen:*\n\n${daftar}`,
        mentions: absenList[m.chat].list
      }, { quoted: m });
  }
}
