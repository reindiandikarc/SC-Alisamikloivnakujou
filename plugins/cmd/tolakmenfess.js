// Plugin: tolakmenfess
// Auto-generated from Alya V12
// Commands: tolakmenfess

const path = require('path')

module.exports = {
  command: ["tolakmenfess"],
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
        const roof = Object.values(alya.menfes).find(menpes => [menpes.a, menpes.b].includes(m.sender));
        if (!roof) return replyalya("Belum ada sesi menfess");

        const other = [roof.a, roof.b].find(user => user !== m.sender);
        await alya.sendMessage(other, {
            text: `_Maaf, @${m.sender.split("@")[0]} menolak menfess kamu._`,
            mentions: [m.sender],
        });
        replyalya("Menfess berhasil ditolak.");
        delete alya.menfes[roof.id];
  }
}
