// Plugin: balasmenfess
// Auto-generated from Alya V12
// Commands: balasmenfess

const path = require('path')

module.exports = {
  command: ["balasmenfess"],
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

        const room = Object.values(alya.menfes).find(room => [room.a, room.b].includes(m.sender) && room.state === 'WAITING');
        if (!room) return replyalya("Tidak ada sesi menfess yang sedang menunggu");

        const other = [room.a, room.b].find(user => user !== m.sender);
        room.b = m.sender;
        room.state = 'CHATTING';
        alya.menfes[room.id] = { ...room };

        await alya.sendMessage(other, {
            text: `_@${m.sender.split("@")[0]} telah menerima menfess kamu, sekarang kamu bisa chat lewat bot ini._\n\n*NOTE:* Ketik .stopmenfess untuk berhenti.`,
            mentions: [m.sender],
        });
        replyalya("Menfess diterima, sekarang kamu bisa chat!");
        m.reply("Silakan balas pesan langsung di chat ini. Semua pesan akan diteruskan.");
  }
}
