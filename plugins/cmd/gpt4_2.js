// Plugin: gpt4_2
// Refactored — Pakai lib/scraper-bell.js (apikey Bell409 via api.termai.cc), fallback otomatis ke Gemini/Supabase
// Commands: gpt4_2

'use strict';

const { askBell } = require('../../lib/scraper-bell');

module.exports = {
  command: ["gpt4_2"],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx;

    if (!text) return replyalya(
      `🤖 *GPT-4 v2*\n\n• *Contoh:* ${prefix}${command} cara membuat program Python sederhana\n\n_Powered by GPT-4 v2_`
    );

    await alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

    const prompt =
      `Kamu adalah GPT-4 versi 2, model AI generasi terbaru yang sangat canggih. ` +
      `Spesialisasimu: coding, teknologi, sains, dan analisis mendalam. ` +
      `Jawab dengan terstruktur dan gunakan bahasa Indonesia. ` +
      `Pertanyaan dari ${pushname}: ${text}`;

    const result = await askBell({ prompt });

    if (!result.status) {
      return replyalya(`❌ Semua API Key gagal.\n_Detail: ${result.error}_`);
    }

    await m.reply(`🤖 *GPT-4 v2:*\n\n${result.text}`);
  }
};
