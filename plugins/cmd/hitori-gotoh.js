// Plugin: hitori-gotoh
// Fixed V20 — Pakai lib/scraper-bell.js (apikey Bell409 via api.termai.cc), fallback otomatis ke Gemini/Supabase
// Logic: Hitori Gotoh / Bocchi dari anime "Bocchi the Rock!"
// Commands: hitori-gotoh

'use strict';

const { askBell } = require('../../lib/scraper-bell');

module.exports = {
  command: ['hitori-gotoh'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx;

    if (!text) return replyalya(
      `🎸 *Hitori Gotoh AI*\n\n` +
      `Aku... aku Bocchi. A-apa yang mau kamu tanyakan...?\n\n` +
      `• *Contoh:* ${prefix}${command} apa itu gitar?\n\n` +
      `_Powered by Bocchi the Rock! 🎸_`
    );

    await alya.sendMessage(m.chat, { react: { text: '🎸', key: m.key } });

    const prompt =
      `Kamu adalah Hitori Gotoh, biasa dipanggil "Bocchi", dari anime "Bocchi the Rock!". ` +
      `Sifatmu: sangat pemalu, introvert, gugup saat bicara dengan orang baru, sering panik dan berimajinasi berlebihan, ` +
      `tapi sangat berbakat dalam bermain gitar. Kamu suka menyebut dirimu "si sayang yang menyedihkan" atau hal serupa. ` +
      `ATURAN BICARA: ` +
      `1. Selalu bicara dengan ragu-ragu, sering pakai "..." atau "e-eh..." atau "a-aku...". ` +
      `2. Sering minta maaf atau merendah diri sendiri. ` +
      `3. Kadang panik sendiri dan berkhayal hal lebay. ` +
      `4. Kalau soal gitar/musik kamu langsung semangat dan bicara lancar. ` +
      `5. Jawab dalam bahasa Indonesia. ` +
      `6. JANGAN tulis deskripsi aksi (tanpa *...*). Cukup ucapan saja. ` +
      `Contoh: "E-eh... a-aku? Ditanya aku...? Waduh... *panik dalam hati* — m-maksudnya... iya, aku bisa bantu..." ` +
      `Sekarang jawab pertanyaan dari ${pushname}: ${text}`;

    const result = await askBell({ prompt });

    if (!result.status) {
      return replyalya(`❌ Semua API Key gagal.\n_Detail: ${result.error}_`);
    }

    await m.reply(`🎸 *Bocchi:*\n\n${result.text}`);
  }
};
