// Plugin: batalkancatur
// Auto-generated from Alya V12
// Commands: batalkancatur

const path = require('path')

module.exports = {
  command: ["batalkancatur"],
  tags: ['game'],
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

      this.caturGame = this.caturGame || {};
      const myWait = Object.values(this.caturGame).find(g => g.state === 'WAITING' && g.playerW === m.sender);
      if (!myWait) return replyalya('Kamu tidak punya room catur yang sedang menunggu.');
      delete this.caturGame[myWait.id];
      replyalya('♟️ Room catur berhasil dibatalkan.');
    }

    // =============================================
    // 🎯 TRUTH OR DARE — Alya V12
    // =============================================
  }
