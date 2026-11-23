// Plugin: bardai
// Fixed V20 — Rewritten to use Gemini (bracket error + AlyaAI undefined)
// Commands: bardai, bard

'use strict';

const { askBell } = require('../../lib/scraper-bell');

module.exports = {
  command: ['bardai', 'bard'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx;

    if (!text) return replyalya(
      `🧠 *Bard AI*\n\n• *Contoh:* ${prefix}${command} jelaskan tentang alam semesta\n\n_Powered by Bard AI_`
    );

    await alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

    const prompt =
      `Kamu adalah Bard AI, asisten AI yang kreatif dan berpengetahuan luas dari Google. ` +
      `Jawab pertanyaan dengan detail, kreatif, dan menggunakan bahasa Indonesia yang baik. ` +
      `Pertanyaan dari ${pushname}: ${text}`;

    const result = await askBell({ prompt });

    if (!result.status) {
      return replyalya(`❌ Semua API Key gagal.\n_Detail: ${result.error}_`);
    }

    await m.reply(result.text);
  }
};
