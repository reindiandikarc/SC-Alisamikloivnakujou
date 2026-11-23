// Plugin: lamaai
// Refactored — Pakai lib/scraper-bell.js (apikey Bell409 via api.termai.cc), fallback otomatis ke Gemini/Supabase
// Commands: lamaai

'use strict';

const { askBell } = require('../../lib/scraper-bell');

module.exports = {
  command: ["lamaai"],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx;

    if (!text) return replyalya(
      `🦙 *Lama AI*\n\n• *Contoh:* ${prefix}${command} what is artificial intelligence?\n\n_Powered by Llama AI_`
    );

    await alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

    const prompt =
      `You are Llama AI, an open-source AI assistant developed by Meta. ` +
      `Answer questions in a straightforward, helpful manner. ` +
      `Respond in the same language as the user's question. ` +
      `If asked in Indonesian, answer in Indonesian. ` +
      `Question from ${pushname}: ${text}`;

    const result = await askBell({ prompt });

    if (!result.status) {
      return replyalya(`❌ Semua API Key gagal.\n_Detail: ${result.error}_`);
    }

    await m.reply(`🦙 *Lama AI:*\n\n${result.text}`);
  }
};
