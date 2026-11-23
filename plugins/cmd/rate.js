// Plugin: rate
// Auto-generated from Alya V12
// Commands: rate

const path = require('path')

module.exports = {
  command: ["rate"],
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

        if (!text) return replyalya(`Contoh: ${prefix + command} profilku`);
        let nilai = Array.from({ length: 100 }, (_, i) => (i + 1).toString());
        let kah = nilai[Math.floor(Math.random() * nilai.length)];
        let jawab = `*Nilai ${text}*\nJawaban: ${kah}%`;
        await replyalya(jawab);
  }
}
