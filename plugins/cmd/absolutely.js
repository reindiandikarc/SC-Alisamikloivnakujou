// Plugin: absolutely
// Refactored — Pakai lib/scraper-bell.js (apikey Bell409 via api.termai.cc), fallback otomatis ke Gemini/Supabase
// Commands: absolutely

'use strict';

const { askBell } = require('../../lib/scraper-bell');

module.exports = {
  command: ["absolutely"],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx;

    if (!text) return replyalya(
      `🧠 *Absolutely AI*\n\n• *Contoh:* ${prefix}${command} tuliskan puisi tentang cinta\n\n_Powered by Absolutely AI_`
    );

    await alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

    const prompt =
      `Kamu adalah Absolutely AI, asisten AI yang bisa menjawab apa saja dengan absolutely yakin dan percaya diri. ` +
      `Jawab pertanyaan dengan detail, menarik, dan penuh keyakinan dalam bahasa Indonesia. ` +
      `Permintaan dari ${pushname}: ${text}`;

    const result = await askBell({ prompt });

    if (!result.status) {
      return replyalya(`❌ Semua API Key gagal.\n_Detail: ${result.error}_`);
    }

    await m.reply(result.text);
  }
};
