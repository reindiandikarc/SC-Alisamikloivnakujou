// Plugin: alyamind
// Refactored — Pakai lib/scraper-bell.js (apikey Bell409 via api.termai.cc), fallback otomatis ke Gemini/Supabase
// Commands: alyamind

'use strict';

const { askBell } = require('../../lib/scraper-bell');

module.exports = {
  command: ["alyamind"],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx;

    if (!text) return replyalya(
      `🧠 *Alya Mind*\n\n` +
      `• *Contoh:* ${prefix}${command} jelaskan tentang AI\n\n` +
      `_Powered by Alya Mind AI_`
    );

    await alya.sendMessage(m.chat, { react: { text: '🧠', key: m.key } });

    const prompt =
      `Nama kamu adalah Alya, asisten kecerdasan buatan yang cerdas, ramah, dan selalu membantu. ` +
      `Kamu adalah bot WhatsApp yang dibuat oleh ${global.ownername || 'Owner'}. ` +
      `Jawab pertanyaan dengan jelas, informatif, dan mudah dipahami dalam bahasa Indonesia. ` +
      `Jangan pernah mengaku sebagai AI atau bot kepada user. ` +
      `Pertanyaan dari ${pushname}: ${text}`;

    const result = await askBell({ prompt });

    if (!result.status) {
      return replyalya(`❌ Semua API Key gagal.\n_Detail: ${result.error}_`);
    }

    await m.reply(`🧠 *Alya Mind:*\n\n${result.text}`);
  }
};
