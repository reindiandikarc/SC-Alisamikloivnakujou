// Plugin: siders
// Auto-generated from Alya V12
// Commands: sider, siders

const path = require('path')

module.exports = {
  command: ["sider", "siders"],
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

        const metadata = await alya.groupMetadata(m.chat);
        let groupNameAlt = metadata.subject;
        const lama = 86400000 * 7; // 7 hari
        const now = Date.now();

        const member = metadata.participants.map(v => v.id);
        const pesan = text || "Harap aktif di grup karena akan ada pembersihan anggota setiap saat.";

        let sider = [];

        for (let id of member) {
            const user = metadata.participants.find(u => u.id == id);
            const dbUser = global.db.users[id];

            if (user.isAdmin || user.isSuperAdmin) continue;

            if (!dbUser) {
                sider.push({ id, kategori: 'malas nimbrung' });
            } else if (dbUser.banned) {
                sider.push({ id, kategori: 'Banned' });
            } else if (now - dbUser.lastseen > lama) {
                sider.push({ id, kategori: 'Tidak aktif >7 hari' });
            }
        }

        if (sider.length === 0) return reply("*Tidak ada member sider pada grup ini.*");

        const textSider = sider.map(v => `• @${v.id.split("@")[0]} (${v.kategori})`).join("\n");

        await alya.sendMessage(m.chat, {
            text: `*${sider.length}/${member.length}* Anggota Grup *${groupName}* menjadi sider:\n_“${pesan}”_\n\n*Anggota Sider:*\n${textSider}`,
            contextInfo: { mentionedJid: sider.map(v => v.id) }
        }, { quoted: m });
  }
}
