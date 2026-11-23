// Plugin: unbanuser
// Auto-generated from Alya V12
// Commands: unbanned, unbanuser

const path = require('path')

module.exports = {
  command: ["unbanned", "unbanuser"],
  tags: ['admin'],
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

        if (!Ryuu && !isAdmins) return replytolak('Fitur hanya untuk owner/admin!');
        let who = (m.mentionedJid && m.mentionedJid[0])
            ? m.mentionedJid[0]
            : m.quoted ? m.quoted.sender
            : args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
            : null;
        if (!who) return replyalya(`Tag atau reply user yang ingin di-unbanned ya~`);
        if (!global.db.users[who]) return replyalya('User tidak ditemukan di database.');
        global.db.users[who].banned = false;
        global.db.users[who].bannedTime = 0;
        replyalya(`✅ User *@${who.split('@')[0]}* sudah aku unbanned!`);
  }
}
