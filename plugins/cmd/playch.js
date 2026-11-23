// Plugin: playch
// Commands: playch
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['playch'],
  tags: ['download'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

if (!Ryuu) return reply(mess.only.owner)
    if (!text) return reply(`*Contoh :* ${prefix + command} To the bone`)
    await playCh2(alya, text, reply)
  }
};
