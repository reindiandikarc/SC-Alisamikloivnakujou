// Plugin: delvote
// Commands: deletevote, delvote, hapusvote
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['deletevote', 'delvote', 'hapusvote'],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

    // Vote storage (persistent across calls in same session)
    if (!global._voteDB) global._voteDB = {};
    const voteData = global._voteDB;

    if (!m.isGroup) return replytolak(mess.only.group)
    if (!(m.chat in voteData)) return replyalya(`_*no voting in this group!*_\n\n*${prefix}vote* - to start voting`)
    delete voteData[m.chat]
    replyalya('Successfully Deleted Vote Session In This Group')
  }
};
