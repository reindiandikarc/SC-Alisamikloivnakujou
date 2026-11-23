// Plugin: guru-ai
// Refactored — Pakai lib/scraper-bell.js (apikey Bell409 via api.termai.cc), fallback otomatis ke Gemini/Supabase
// Commands: guru-ai

'use strict';

const { askBell } = require('../../lib/scraper-bell');

module.exports = {
  command: ["guru-ai"],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx;

    if (!text) return replyalya(
      `📚 *Guru AI*\n\n• *Contoh:* ${prefix}${command} jelaskan hukum Newton ke-2\n\n_Guru AI siap mengajarkanmu!_`
    );

    await alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

    const prompt =
      `Kamu adalah Guru AI, seorang guru digital yang sangat sabar, ramah, dan ahli di semua bidang pelajaran. ` +
      `Spesialisasimu: matematika, fisika, kimia, biologi, sejarah, bahasa Indonesia, bahasa Inggris, dan lainnya. ` +
      `Cara mengajarmu: jelaskan dengan contoh yang mudah dipahami, gunakan analogi sehari-hari, ` +
      `dan pastikan murid benar-benar mengerti sebelum melanjutkan. ` +
      `Gunakan bahasa Indonesia yang ramah dan mudah dipahami. ` +
      `Pertanyaan dari murid (${pushname}): ${text}`;

    const result = await askBell({ prompt });

    if (!result.status) {
      return replyalya(`❌ Semua API Key gagal.\n_Detail: ${result.error}_`);
    }

    await m.reply(`📚 *Guru AI:*\n\n${result.text}`);
  }
};
