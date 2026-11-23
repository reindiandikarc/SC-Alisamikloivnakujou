// Plugin: blackboxai
// Refactored — Pakai lib/scraper-bell.js (apikey Bell409 via api.termai.cc), fallback otomatis ke Gemini/Supabase
// Commands: blackboxai

'use strict';

const { askBell } = require('../../lib/scraper-bell');

module.exports = {
  command: ["blackboxai"],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx;

    if (!text) return replyalya(
      `⬛ *Blackbox AI*\n\n• *Contoh:* ${prefix}${command} buatkan code Python hello world\n\n_Powered by Blackbox AI — Spesialis Coding_`
    );

    await alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

    const prompt =
      `Kamu adalah Blackbox AI, asisten AI yang spesialis dalam pemrograman dan coding. ` +
      `Kamu sangat ahli dalam berbagai bahasa pemrograman: Python, JavaScript, PHP, Java, C++, dan lainnya. ` +
      `Selalu berikan kode yang bersih, terkomentari, dan berjalan dengan baik. ` +
      `Gunakan bahasa Indonesia untuk penjelasan, tapi kode tetap dalam bahasa pemrograman yang diminta. ` +
      `Pertanyaan dari ${pushname}: ${text}`;

    const result = await askBell({ prompt });

    if (!result.status) {
      return replyalya(`❌ Semua API Key gagal.\n_Detail: ${result.error}_`);
    }

    await m.reply(`⬛ *Blackbox AI:*\n\n${result.text}`);
  }
};
