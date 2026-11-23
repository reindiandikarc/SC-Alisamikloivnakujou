// Plugin: tagadmin
// Commands: tagadmin
// Exact logic dari Alya V10 — tag semua admin grup
// Fixed V13: ctx.groupAdmins, ctx.groupMembers (tanpa re-fetch groupMetadata)

'use strict';

module.exports = {
  command: ['tagadmin'],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const {
      isGroup,
      groupMembers,
      groupName,
      Ryuu, isAdmins, isBotAdmins,
      reply, replyalya, replytolak,
    } = ctx;

    if (!isGroup) return alya.sendMessage(m.chat, { text: '🚫 Perintah ini hanya bisa digunakan di grup!' });

    // Ambil data admin dari groupMembers (ctx sudah menyediakan ini)
    const members = Array.isArray(groupMembers) ? groupMembers : [];

    const adminIds   = [];
    const adminNames = [];
    const adminList  = [];

    for (const p of members) {
      const id    = p.id || p.jid || (typeof p === 'string' ? p : null);
      const admin = p.admin || null;
      if (!id) continue;
      if (admin === 'admin' || admin === 'superadmin') {
        adminIds.push(id);
        adminNames.push(id.split('@')[0]);
        adminList.push(`@${id.split('@')[0]}`);
      }
    }

    if (adminList.length === 0) {
      return alya.sendMessage(m.chat, { text: '😓 Tidak ada admin di grup ini.' });
    }

    const tagMessage =
      `🌟 *Admin Grup*:\n\n` +
      `*Nama Grup:* ${groupName || 'Grup'}\n\n` +
      adminNames.map((name, i) =>
        `*${name}* (@${adminIds[i].split('@')[0]})`
      ).join('\n');

    alya.sendMessage(
      m.chat,
      {
        text: tagMessage,
        mentions: adminIds,
      },
      { quoted: m }
    );
  },
};
