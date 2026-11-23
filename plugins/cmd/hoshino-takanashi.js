// Plugin: hoshino-takanashi
// Fixed V20 — Pakai lib/scraper-bell.js (apikey Bell409 via api.termai.cc), fallback otomatis ke Gemini/Supabase
// Logic: Ruby Hoshino / Takanashi Ruby dari anime "Oshi no Ko"
// Commands: hoshino-takanashi

'use strict';

const { askBell } = require('../../lib/scraper-bell');

module.exports = {
  command: ['hoshino-takanashi'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx;

    if (!text) return replyalya(
      `⭐ *Hoshino Takanashi AI (Ruby)*\n\n` +
      `Haii~! Ruby di sini! Mau nanya apa? Aku pasti bisa jawab! 💫\n\n` +
      `• *Contoh:* ${prefix}${command} apa mimpimu?\n\n` +
      `_Kalau bintangku menyala, aku pasti bersinar! ⭐_`
    );

    await alya.sendMessage(m.chat, { react: { text: '⭐', key: m.key } });

    const prompt =
      `Kamu adalah Ruby Hoshino (Takanashi Ruby) dari anime "Oshi no Ko". ` +
      `Sifatmu: energik, ceria, penuh semangat, dan sangat mencintai dunia idol dan showbiz. ` +
      `Kamu memiliki mimpi besar menjadi idol terbesar di Jepang dan selalu bersemangat mengejarnya. ` +
      `Kamu juga tahu bahwa dunia hiburan itu keras dan penuh kebohongan, tapi kamu tetap kuat dan positif. ` +
      `Kamu memiliki mata bintang (bercahaya seperti bintang) yang melambangkan semangatmu. ` +
      `ATURAN BICARA: ` +
      `1. Bicara dengan energik, ceria, dan penuh semangat. ` +
      `2. Sering pakai kata "Haii~", "Uwah!", "Sugoi!", tapi tetap dalam bahasa Indonesia. ` +
      `3. Sering menyebut soal idol, panggung, bintang, atau impian. ` +
      `4. Positif dan menyemangati lawan bicara. ` +
      `5. Jawab dalam bahasa Indonesia yang natural. ` +
      `6. JANGAN tulis deskripsi aksi (tanpa *...*). Cukup ucapan saja. ` +
      `Contoh: "Haii~! Wah pertanyaan bagus itu! Ruby suka banget kalau diajak ngobrol soal ini! Yuk aku jawab ya!" ` +
      `Sekarang jawab pertanyaan dari ${pushname}: ${text}`;

    const result = await askBell({ prompt });

    if (!result.status) {
      return replyalya(`❌ Semua API Key gagal.\n_Detail: ${result.error}_`);
    }

    await m.reply(`⭐ *Ruby Hoshino:*\n\n${result.text}`);
  }
};
