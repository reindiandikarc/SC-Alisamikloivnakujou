// Plugin: ai4chat
// Refactored — Pakai lib/scraper-bell.js (apikey Bell409 via api.termai.cc), fallback otomatis ke Gemini/Supabase
// Commands: ai4chat

'use strict';

const { askBell } = require('../../lib/scraper-bell');

module.exports = {
  command: ["ai4chat"],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx;

    if (!text) return replyalya(
      `💬 *AI4Chat*\n\n• *Contoh:* ${prefix}${command} ceritakan tentang dirimu\n\n_Powered by AI4Chat_`
    );

    await alya.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

    const prompt =
      `Kamu adalah AI4Chat, asisten AI yang ramah, santai, dan menyenangkan untuk diajak ngobrol. ` +
      `Kamu suka bercanda tapi tetap informatif. Gunakan bahasa Indonesia yang santai dan friendly. ` +
      `Pesan dari ${pushname}: ${text}`;

    const result = await askBell({ prompt });

    if (!result.status) {
      return replyalya(`❌ Semua API Key gagal.\n_Detail: ${result.error}_`);
    }

    await m.reply(result.text);
  }
};
