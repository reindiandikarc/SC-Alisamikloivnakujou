// Plugin: gpt4
// Refactored — Pakai lib/scraper-bell.js (apikey Bell409 via api.termai.cc), fallback otomatis ke Gemini/Supabase
// Commands: gpt4

'use strict';

const { askBell } = require('../../lib/scraper-bell');

module.exports = {
  command: ["gpt4"],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx;

    if (!text) return replyalya(
      `🤖 *GPT-4 AI*\n\n• *Contoh:* ${prefix}${command} jelaskan cara kerja algoritma\n\n_Powered by GPT-4_`
    );

    await alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

    const prompt =
      `Kamu adalah GPT-4, model bahasa AI terdepan yang sangat cerdas dan mampu menjawab pertanyaan kompleks. ` +
      `Jawab dengan detail, terstruktur, dan akurat. Gunakan bahasa Indonesia. ` +
      `Pertanyaan dari ${pushname}: ${text}`;

    const result = await askBell({ prompt });

    if (!result.status) {
      return replyalya(`❌ Semua API Key gagal.\n_Detail: ${result.error}_`);
    }

    await m.reply(`🤖 *GPT-4:*\n\n${result.text}`);
  }
};
