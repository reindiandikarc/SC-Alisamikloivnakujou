// Plugin: gemini
// Refactored — Pakai lib/scraper-bell.js (apikey Bell409 via api.termai.cc), fallback otomatis ke Gemini/Supabase
// Commands: chatgpt, gemini

'use strict';

const { askBell } = require('../../lib/scraper-bell');

module.exports = {
  command: ["chatgpt", "gemini"],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx;

    if (!text) return replyalya(
      `✨ *Gemini AI*\n\n• *Contoh:* ${prefix}${command} apa itu machine learning?\n\n_Powered by Google Gemini_`
    );

    await alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

    const prompt =
      `Kamu adalah Gemini, model AI terdepan dari Google yang sangat cerdas. ` +
      `Jawab pertanyaan dengan akurat, mendalam, dan kreatif dalam bahasa Indonesia. ` +
      `Pertanyaan dari ${pushname}: ${text}`;

    const result = await askBell({ prompt });

    if (!result.status) {
      return replyalya(`❌ Semua API Key gagal.\n_Detail: ${result.error}_`);
    }

    await m.reply(`✨ *Gemini:*\n\n${result.text}`);
  }
};
