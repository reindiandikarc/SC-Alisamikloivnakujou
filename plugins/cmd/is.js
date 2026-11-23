// Plugin: is
// Auto-generated from Alya V12
// Commands: is

const path = require('path')

module.exports = {
  command: ["is"],
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

        if (!text) return replyalya(`Ajukan pertanyaan\n\nContoh: ${prefix + command} dia masih perawan?`);
        let apa = [`Ya`, `Tidak`, `Mungkin Saja`, `Benar Sekali`];
        let kah = apa[Math.floor(Math.random() * apa.length)];
        let jawab = `*[ Apakah ${text} ]*\nJawaban: ${kah}`;
        await replyalya(jawab);
  }
}
