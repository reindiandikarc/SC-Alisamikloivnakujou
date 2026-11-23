// Plugin: bingai
// Refactored — Pakai lib/scraper-bell.js (apikey Bell409 via api.termai.cc), fallback otomatis ke Gemini/Supabase
// Commands: bingai

'use strict';

const { askBell } = require('../../lib/scraper-bell');

module.exports = {
  command: ["bingai"],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx;

    if (!text) return replyalya(
      `🔍 *Bing AI*\n\n• *Contoh:* ${prefix}${command} berita terkini AI\n\n_Powered by Bing AI_`
    );

    await alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

    const prompt =
      `Kamu adalah Bing AI (Copilot), asisten AI dari Microsoft yang terhubung ke internet. ` +
      `Jawab pertanyaan dengan informatif, terkini, dan menggunakan bahasa Indonesia. ` +
      `Jika ditanya soal berita atau info terkini, berikan pengetahuan terbaikmu. ` +
      `Pertanyaan dari ${pushname}: ${text}`;

    const result = await askBell({ prompt });

    if (!result.status) {
      return replyalya(`❌ Semua API Key gagal.\n_Detail: ${result.error}_`);
    }

    await m.reply(result.text);
  }
};
