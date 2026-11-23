// Plugin: leptonai
// Refactored — Pakai lib/scraper-bell.js (apikey Bell409 via api.termai.cc), fallback otomatis ke Gemini/Supabase
// Commands: lepton, leptonai

'use strict';

const { askBell } = require('../../lib/scraper-bell');

module.exports = {
  command: ["lepton", "leptonai"],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx;

    if (!text) return replyalya(
      `🧠 *Lepton AI*\n\n• *Contoh:* ${prefix + command} Siapakah penemu komputer pertama di dunia?\n\n💡 Tanya apa saja, gratis!`
    );

    await alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

    const prompt =
      `Kamu adalah Lepton AI, asisten pintar dan serba tahu. ` +
      `Jawab pertanyaan dengan jelas, akurat, dan mudah dipahami dalam Bahasa Indonesia. ` +
      `Pertanyaan: ${text}`;

    const result = await askBell({ prompt });

    if (!result.status) {
      return replyalya(`❌ Semua API Key gagal.\n_Detail: ${result.error}_`);
    }

    await m.reply(result.text);
  }
};
