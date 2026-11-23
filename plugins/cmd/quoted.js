// Plugin: quoted
// Commands: q, quoted
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['q', 'quoted'],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

    if (!m.quoted) return replyalya('Reply the Message!!')
    const xeonquotx = await alya.serializeM(await m.getQuotedObj())
    if (!xeonquotx.quoted) return replyalya('Pesan yang Anda balas tidak dikirim oleh bot')
    await xeonquotx.quoted.copyNForward(m.chat, true)
  }
};
