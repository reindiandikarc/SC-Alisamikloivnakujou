// Plugin: what
// Auto-generated from Alya V12
// Commands: what

const path = require('path')

module.exports = {
  command: ["what"],
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

        if (!text) return replyalya(`Ajukan pertanyaan\n\nContoh: ${prefix + command} namamu?`);
        let lel = [`Tanya Pacarmu`, `Aku Tidak Tahu`, `Aku Tidak Tahu, Tanya Ayahmu`];
        let kah = lel[Math.floor(Math.random() * lel.length)];
        let jawab = `*Apa ${text}*\nJawaban: ${kah}`;
        await replyalya(jawab);
  }
}
