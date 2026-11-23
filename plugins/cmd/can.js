// Plugin: can
// Auto-generated from Alya V12
// Commands: can

const path = require('path')

module.exports = {
  command: ["can"],
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

        if (!text) return replyalya(`Ajukan pertanyaan\n\nContoh: ${prefix + command} aku bisa menari?`);
        let bisa = [`Bisa`, `Tidak Bisa`, `Tidak Mungkin`, `Tentu Saja Bisa!!!`];
        let keh = bisa[Math.floor(Math.random() * bisa.length)];
        let jawab = `*Bisa ${text}*\nJawaban: ${keh}`;
        await replyalya(jawab);
  }
}
