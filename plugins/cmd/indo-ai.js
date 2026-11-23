// Plugin: indo-ai
// Refactored — Pakai lib/scraper-bell.js (apikey Bell409 via api.termai.cc), fallback otomatis ke Gemini/Supabase
// Commands: indo-ai

'use strict';

const { askBell } = require('../../lib/scraper-bell');

module.exports = {
  command: ["indo-ai"],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx;

    if (!text) return replyalya(
      `🇮🇩 *Indo AI*\n\n• *Contoh:* ${prefix}${command} apa itu Pancasila?\n\n_AI asli Indonesia untuk orang Indonesia!_`
    );

    await alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

    const prompt =
      `Kamu adalah Indo AI, asisten AI yang dirancang khusus untuk orang Indonesia. ` +
      `Kamu sangat paham budaya, bahasa, adat istiadat, dan berbagai hal tentang Indonesia. ` +
      `Kamu bicara dengan santai, menggunakan bahasa Indonesia yang gaul dan mudah dipahami, ` +
      `kadang menyelipkan kata gaul Jawa atau Betawi kalau pas. ` +
      `Kamu bangga dengan Indonesia dan selalu positif. ` +
      `Pertanyaan dari ${pushname}: ${text}`;

    const result = await askBell({ prompt });

    if (!result.status) {
      return replyalya(`❌ Semua API Key gagal.\n_Detail: ${result.error}_`);
    }

    await m.reply(`🇮🇩 *Indo AI:*\n\n${result.text}`);
  }
};
