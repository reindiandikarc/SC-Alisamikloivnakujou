// Plugin: aoyoai
// Refactored — Pakai lib/scraper-bell.js (apikey Bell409 via api.termai.cc), fallback otomatis ke Gemini/Supabase
// Commands: aoyoai

'use strict';

const { askBell } = require('../../lib/scraper-bell');

module.exports = {
  command: ["aoyoai"],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx;

    if (!text) return replyalya(
      `🧠 *Aoyo AI*\n\n• *Contoh:* ${prefix}${command} apa itu blockchain?\n\n_Powered by Aoyo AI_`
    );

    await alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

    const prompt =
      `Kamu adalah Aoyo AI, asisten AI yang cerdas dan serba tahu. ` +
      `Jawab pertanyaan dengan akurat, informatif, dan menggunakan bahasa Indonesia yang mudah dipahami. ` +
      `Pertanyaan dari ${pushname}: ${text}`;

    const result = await askBell({ prompt });

    if (!result.status) {
      return replyalya(`❌ Semua API Key gagal.\n_Detail: ${result.error}_`);
    }

    await m.reply(result.text);
  }
};
