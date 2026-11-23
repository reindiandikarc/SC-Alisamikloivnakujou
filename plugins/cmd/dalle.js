// Plugin: dalle
// Commands: dalle
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['dalle'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

if (!text) return replyalya(`*This command generates images from text prompts*\n\n*𝙴xample usage*\n*${prefix + command} Beautiful anime girl*\n*${prefix + command} girl in pink dress*`)
  reply(mess.wait)
let data = await BingAlya(text)
  }
};
