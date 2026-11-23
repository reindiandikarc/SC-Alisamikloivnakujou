// Plugin: resetlink
// Commands: resetlink, resetgrouplink, resetgclink, resetgruplink
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['resetlink', 'resetgrouplink', 'resetgclink', 'resetgruplink'],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

if (!m.isGroup) return replytolak(mess.only.group)
if (!isBotAdmins) return replytolak('_Bot Harus Menjadi Admin Terlebih Dahulu_')
if (!isAdmins && !Ryuu) return reply('Khusus Admin!!')
alya.groupRevokeInvite(m.chat)
  }
};
