// Plugin: powerbrain
// Refactored — Pakai lib/scraper-bell.js (apikey Bell409 via api.termai.cc), fallback otomatis ke Gemini/Supabase
// Commands: powerbrain

'use strict';

const { askBell } = require('../../lib/scraper-bell');

module.exports = {
  command: ["powerbrain"],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx;

    if (!text) return replyalya(
      `🧠 *PowerBrain AI*\n\n• *Contoh:* ${prefix}${command} jelaskan teori relativitas\n\n_Powered by PowerBrain AI_`
    );

    await alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

    const prompt =
      `Kamu adalah PowerBrain AI, sebuah kecerdasan buatan yang sangat kuat dan berpengetahuan luas. ` +
      `Kamu mampu menjawab pertanyaan dari segala bidang ilmu dengan detail dan akurat. ` +
      `Gunakan bahasa Indonesia yang jelas dan terstruktur. ` +
      `Pertanyaan dari ${pushname}: ${text}`;

    const result = await askBell({ prompt });

    if (!result.status) {
      return replyalya(`❌ Semua API Key gagal.\n_Detail: ${result.error}_`);
    }

    await m.reply(`🧠 *PowerBrain:*\n\n${result.text}`);
  }
};
