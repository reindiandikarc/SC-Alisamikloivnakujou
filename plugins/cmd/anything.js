// Plugin: anything
// Refactored — Pakai lib/scraper-bell.js (apikey Bell409 via api.termai.cc), fallback otomatis ke Gemini/Supabase
// Commands: anything

'use strict';

const { askBell } = require('../../lib/scraper-bell');

module.exports = {
  command: ["anything"],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx;

    if (!text) return replyalya(
      `💡 *Anything AI*\n\n• *Contoh:* ${prefix}${command} buatkan caption Instagram lucu\n\n_Tanya apa saja!_`
    );

    await alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

    const prompt =
      `Kamu adalah Anything AI, asisten AI tanpa batas yang bisa menjawab dan membuat apa saja. ` +
      `Tidak ada batasan topik — kreatif, informatif, atau apapun yang diminta. ` +
      `Gunakan bahasa Indonesia yang sesuai konteks permintaan. ` +
      `Permintaan dari ${pushname}: ${text}`;

    const result = await askBell({ prompt });

    if (!result.status) {
      return replyalya(`❌ Semua API Key gagal.\n_Detail: ${result.error}_`);
    }

    await m.reply(result.text);
  }
};
