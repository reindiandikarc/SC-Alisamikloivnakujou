// Plugin: hytam
// Commands: hytam
// Cek total pesan user di grup — Fixed V13
'use strict';

module.exports = {
  command: ['hytam'],
  tags: ['tools'],
  run: async (alya, m, ctx) => {
    const { sender, pushname, from, isGroup, reply, replyalya } = ctx;

    const userData = global.db?.users?.[sender] || {};
    const totalMsg  = Number(userData.chatCount || userData.chatcount || userData.pesan || 0);
    const totalLimit = Number(userData.limit ?? 0);
    const totalExp   = Number(userData.exp ?? 0);
    const totalMoney = Number(userData.money ?? 0);

    reply(
`📊 *STATISTIK AKTIVITAS*

👤 Nama    : ${pushname || 'Unknown'}
💬 Chat    : ${totalMsg.toLocaleString('id-ID')} pesan
💰 Uang    : Rp ${totalMoney.toLocaleString('id-ID')}
⚡ Limit   : ${totalLimit}
🏆 XP      : ${totalExp}

📌 Statistik global kamu di bot ini.`
    );
  },
};
