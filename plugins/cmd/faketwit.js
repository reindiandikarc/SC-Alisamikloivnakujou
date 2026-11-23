// Plugin: faketwit
// Commands: faketwit
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['faketwit'],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

await fakeTwitHandler(m, alya, args, replyalya);
  }
};
