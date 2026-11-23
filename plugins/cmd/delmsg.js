// Plugin: delmsg
// Commands: delmsg, deletemsg
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['delmsg', 'deletemsg'],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

    if (!text) return reply(`Format: ${prefix}${command} <nama_pesan>`)
    const msgs = global.db.database
    if (!(text.toLowerCase() in msgs)) return replyalya(`'${text}' not listed in the message list`)
    delete msgs[text.toLowerCase()]
    replyalya(`Successfully deleted '${text}' from the message list`)
  }
};
