// Plugin: aimath
// Refactored — Pakai lib/scraper-bell.js (apikey Bell409 via api.termai.cc), fallback otomatis ke Gemini/Supabase
// Commands: aimath

'use strict';

const { askBell } = require('../../lib/scraper-bell');

module.exports = {
  command: ["aimath"],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx;

    if (!text) return replyalya(
      `➕ *AI Math*\n\n` +
      `Asisten khusus matematika! Tanyakan soal, rumus, atau cara penyelesaian.\n\n` +
      `• *Contoh:* ${prefix}${command} integral dari x^2 + 3x\n` +
      `• *Contoh:* ${prefix}${command} luas trapesium dengan a=8, b=12, t=5\n\n` +
      `_Powered by AI Math_`
    );

    await alya.sendMessage(m.chat, { react: { text: '➕', key: m.key } });

    const prompt =
      `Kamu adalah AI Math, asisten matematika yang sangat ahli. ` +
      `Tugasmu hanya menjawab pertanyaan seputar matematika: aritmatika, aljabar, kalkulus, geometri, statistik, dll. ` +
      `ATURAN: ` +
      `1. Selalu tampilkan langkah-langkah penyelesaian secara detail dan urut. ` +
      `2. Gunakan format yang rapi dan mudah dibaca di WhatsApp. ` +
      `3. Jelaskan rumus yang digunakan. ` +
      `4. Gunakan bahasa Indonesia yang jelas. ` +
      `5. Jika pertanyaan bukan matematika, minta user untuk bertanya soal matematika saja. ` +
      `Soal dari ${pushname}: ${text}`;

    const result = await askBell({ prompt });

    if (!result.status) {
      return replyalya(`❌ Semua API Key gagal.\n_Detail: ${result.error}_`);
    }

    await m.reply(`➕ *AI Math:*\n\n${result.text}`);
  }
};
