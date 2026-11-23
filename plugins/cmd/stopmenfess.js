// Plugin: stopmenfess
// Auto-generated from Alya V12
// Commands: stopmenfess

const path = require('path')

module.exports = {
  command: ["stopmenfess"],
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

        alya.menfes = alya.menfes ?? {};
        const find = Object.values(alya.menfes).find(menpes => [menpes.a, menpes.b].includes(m.sender));
        if (!find) return replyalya("Belum ada sesi menfess");

        const to = find.a === m.sender ? find.b : find.a;
        await alya.sendMessage(to, {
            text: "_Sesi menfess ini telah dihentikan._",
            mentions: [m.sender],
        });
        replyalya("Sesi menfess dihentikan.");
        delete alya.menfes[find.id];
  }
}
