// Plugin: cai
// Fixed V20 — Rewritten to use Gemini (extra bracket + AlyaAI undefined)
// Commands: cai

'use strict';

const { askBell } = require('../../lib/scraper-bell');

module.exports = {
  command: ['cai'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx;

    if (!text) return replyalya(
      `💬 *CAI (Character AI)*\n\n• *Contoh:* ${prefix}${command} siapakah Elon Musk?\n\n_Powered by Character AI_`
    );

    await alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

    const prompt =
      `Kamu adalah Character AI, asisten yang bisa berperan sebagai berbagai karakter. ` +
      `Jawab pertanyaan dengan gaya yang menarik dan informatif dalam bahasa Indonesia. ` +
      `Pertanyaan dari ${pushname}: ${text}`;

    const result = await askBell({ prompt });

    if (!result.status) {
      return replyalya(`❌ Semua API Key gagal.\n_Detail: ${result.error}_`);
    }

    await m.reply(result.text);
  }
};
