// Plugin: youai
// Refactored — Pakai lib/scraper-bell.js (apikey Bell409 via api.termai.cc), fallback otomatis ke Gemini/Supabase
// Commands: youai

'use strict';

const { askBell } = require('../../lib/scraper-bell');

module.exports = {
  command: ["youai"],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx;

    if (!text) return replyalya(
      `🧠 *YouAI*\n\n• *Contoh:* ${prefix}${command} siapakah Elon Musk?\n\n_Powered by YouAI_`
    );

    await alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

    const prompt =
      `Kamu adalah YouAI, asisten AI cerdas yang menjawab dengan gaya yang segar dan modern. ` +
      `Jawab dengan informatif, singkat, dan padat dalam bahasa Indonesia. ` +
      `Pertanyaan dari ${pushname}: ${text}`;

    const result = await askBell({ prompt });

    if (!result.status) {
      return replyalya(`❌ Semua API Key gagal.\n_Detail: ${result.error}_`);
    }

    await m.reply(result.text);
  }
};
