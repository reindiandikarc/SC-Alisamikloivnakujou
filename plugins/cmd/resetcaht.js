// Plugin: resetcaht
// Auto-generated from Alya V12
// Commands: clearhistory, resetcaht

const path = require('path')

module.exports = {
  command: ["clearhistory", "resetcaht"],
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

      const cleared = clearUserHistory(sender);
      reply(cleared
        ? `✅ Riwayat percakapan kamu dengan Alya telah dihapus!\n\nAlya akan mulai percakapan baru dari awal~ 🗑️`
        : `Kamu belum punya riwayat percakapan dengan Alya.`
      );
    }

    // ╔══════════════════════════════════════════════════════════════╗
    // ║            🦸 ULTRAMAN GAME - ALYA V12 🦹                   ║
    // ╚══════════════════════════════════════════════════════════════╝
  }
