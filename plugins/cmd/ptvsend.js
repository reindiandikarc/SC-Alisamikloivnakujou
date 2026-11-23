// Plugin: ptvsend
// Auto-generated from Alya V12
// Commands: ptvsend

const path = require('path')

module.exports = {
  command: ["ptvsend"],
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

        if (!Ryuu) return replytolak(mess.only.owner);
        const fs = require("fs");
        const [groupId, filePath] = args;
        if (!groupId || !filePath) return;

        const pathFile = decodeURIComponent(filePath);
        if (!fs.existsSync(pathFile)) return m.reply("❌ File media sudah kadaluwarsa atau hilang.");

        try {
            await alya.sendMessage(groupId, {
                video: fs.readFileSync(pathFile),
                ptv: true
            });

            if (global.channel) {
                await alya.sendMessage(global.channel, { video: fs.readFileSync(pathFile), ptv: true });
            }

            await alya.sendText(m.chat, `✅ PTV berhasil terkirim ke grup tujuan.`);
            await alya.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        } catch (e) {
            console.error(e);
            m.reply("❌ Gagal mengirim PTV ke grup tersebut.");
        } finally {
            if (fs.existsSync(pathFile)) fs.unlinkSync(pathFile); // Hapus file temporary
        }
  }
}
