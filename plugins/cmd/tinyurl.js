// Plugin: tinyurl
// Commands: tinyurl
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['tinyurl'],
  tags: ['tools'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

if(!q) return replyalya('link?')
   const request = require('request')
   request(`https://tinyurl.com/api-create.php?url=${q}`, function (error, response, body) {
   try {
  replyalya(body)
  } catch (e) {
  replyalya(e)
  }
  })
  }
};
