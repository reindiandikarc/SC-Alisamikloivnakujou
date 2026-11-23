// Plugin: herc-ai
// Refactored — Pakai lib/scraper-bell.js (apikey Bell409 via api.termai.cc), fallback otomatis ke Gemini/Supabase
// Commands: herc-ai

'use strict';

const { askBell } = require('../../lib/scraper-bell');

module.exports = {
  command: ["herc-ai"],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx;

    if (!text) return replyalya(
      `🧠 *Herc AI*\n\n• *Contoh:* ${prefix}${command} jelaskan tentang quantum computing\n\n_Powered by Herc AI_`
    );

    await alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

    const prompt =
      `Kamu adalah Herc AI, asisten AI yang kuat dan berpengetahuan luas. ` +
      `Jawab pertanyaan dengan mendalam, terstruktur, dan akurat dalam bahasa Indonesia. ` +
      `Pertanyaan dari ${pushname}: ${text}`;

    const result = await askBell({ prompt });

    if (!result.status) {
      return replyalya(`❌ Semua API Key gagal.\n_Detail: ${result.error}_`);
    }

    await m.reply(`🧠 *Herc AI:*\n\n${result.text}`);
  }
};
