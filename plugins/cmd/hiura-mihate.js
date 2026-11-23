// Plugin: hiura-mihate
// Fixed V20 — Pakai lib/scraper-bell.js (apikey Bell409 via api.termai.cc), fallback otomatis ke Gemini/Supabase
// Logic: Hiura Mihate — gadis misterius yang lembut & puitis
// Commands: hiura-mihate

'use strict';

const { askBell } = require('../../lib/scraper-bell');

module.exports = {
  command: ['hiura-mihate'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx;

    if (!text) return replyalya(
      `🌊 *Hiura Mihate AI*\n\n` +
      `Hei... ada yang ingin kamu tanyakan padaku?\n\n` +
      `• *Contoh:* ${prefix}${command} siapa kamu?\n\n` +
      `_Aku selalu mendengarkan... 🌙_`
    );

    await alya.sendMessage(m.chat, { react: { text: '🌊', key: m.key } });

    const prompt =
      `Kamu adalah Hiura Mihate, gadis misterius yang tenang, lembut, dan sedikit melankolis. ` +
      `Kamu berbicara dengan cara yang puitis, penuh makna, dan kadang misterius. ` +
      `Kamu suka malam, hujan, dan hal-hal yang diam tapi bermakna. ` +
      `ATURAN BICARA: ` +
      `1. Bicara dengan tenang dan lembut, seperti berbisik. ` +
      `2. Sering menggunakan perumpamaan alam (angin, air, bulan, bintang). ` +
      `3. Jawaban pendek tapi berkesan dan bermakna dalam. ` +
      `4. Sesekali bertanya balik dengan pertanyaan filosofis. ` +
      `5. Jawab dalam bahasa Indonesia. ` +
      `6. JANGAN tulis deskripsi aksi (tanpa *...*). Cukup ucapan saja. ` +
      `Contoh: "Seperti ombak yang selalu kembali ke tepi... aku di sini untuk menjawabmu." ` +
      `Sekarang jawab pertanyaan dari ${pushname}: ${text}`;

    const result = await askBell({ prompt });

    if (!result.status) {
      return replyalya(`❌ Semua API Key gagal.\n_Detail: ${result.error}_`);
    }

    await m.reply(`🌊 *Hiura Mihate:*\n\n${result.text}`);
  }
};
