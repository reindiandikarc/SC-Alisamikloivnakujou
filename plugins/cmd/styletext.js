// Plugin: styletext
// Commands: style, styletext
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['style', 'styletext'],
  tags: ['tools'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

    if (!text) return replyalya('Enter Query text!')

    try {
      const { styletext } = require('../../lib/scraper')
      const anu = await styletext(text)
      let teks = `Style Text From ${text}\n\n`
      for (const i of anu) {
        teks += `✨ *${i.name}* : ${i.result}\n\n`
      }
      replyalya(teks)
    } catch (e) {
      console.error('[styletext] error:', e?.message || e)
      replyalya(`❌ Gagal generate style text.\n_${e?.message || ''}_`)
    }
  }
};
