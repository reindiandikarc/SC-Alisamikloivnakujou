// Plugin: how
// Auto-generated from Alya V12
// Commands: how

const path = require('path')

module.exports = {
  command: ["how"],
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

        if (!text) return replyalya(`Ajukan pertanyaan\n\nContoh: ${prefix + command} cara mendapatkan pacar?`);
        let gimana = [
            `Ummm...`, `Itu Sulit Bro`, `Maaf, Bot Tidak Bisa Menjawab`, `Coba Cari di Google`,
            `Ya Ampun! Serius???`, `Pusing Ah😴, malas jawab`, `Ohhh Aku Mengerti:(`,
            `Sabar ya Boss:(`, `Seriusan bro 🙄`
        ];
        let kah = gimana[Math.floor(Math.random() * gimana.length)];
        let jawab = `*Bagaimana ${text}*\nJawaban: ${kah}`;
        await replyalya(jawab);
  }
}
