// Plugin: where
// Auto-generated from Alya V12
// Commands: where

const path = require('path')

module.exports = {
  command: ["where"],
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

        if (!text) return replyalya(`Ajukan pertanyaan\n\nContoh: ${prefix + command} kamu berada?`);
        let lokasi = [`Di gunung`, `Di Mars`, `Di Bulan`, `Di hutan`, `Aku tidak tahu, tanya ibumu`, `Mungkin di suatu tempat`];
        let kah = lokasi[Math.floor(Math.random() * lokasi.length)];
        let jawab = `*Dimana ${text}*\nJawaban: ${kah}`;
        await replyalya(jawab);
  }
}
