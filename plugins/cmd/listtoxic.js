// Plugin: listtoxic
// Auto-generated from Alya V12
// Commands: listbadword, listtoxic

const path = require('path')

module.exports = {
  command: ["listbadword", "listtoxic"],
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

        if (badwords.length < 1) return replyalya("📭 Belum ada badword yang ditambahkan.");
        let list = badwords.map((w, i) => `${i+1}. ${w}`).join("\n");
        replyalya(`📌 *Daftar Badword/Toxic*\n\n${list}`);
    }
    //==================================================================
  }
