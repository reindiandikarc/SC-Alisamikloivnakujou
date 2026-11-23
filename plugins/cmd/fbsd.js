// Plugin: fbsd
// Commands: fbsd
// Download video Facebook versi SD (ukuran lebih kecil)

'use strict';

const { getFbVideo } = require('../../fitur/fbdl');

module.exports = {
  command: ['fbsd'],
  tags: ['downloader'],
  run: async (alya, m, ctx) => {
    const { prefix, command, text, replyalya } = ctx;

    if (!text) return replyalya(`Contoh: ${prefix}${command} https://fb.watch/xxxx`);
    if (!/facebook\.com|fb\.watch|fb\.com/.test(text)) {
      return replyalya('❌ Link tidak valid!');
    }

    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
      const { hd, sd } = await getFbVideo(text.trim());
      const videoUrl = sd || hd;

      if (!videoUrl) {
        await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return replyalya('❌ Video tidak ditemukan atau privat.');
      }

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      await alya.sendMessage(m.chat, {
        video  : { url: videoUrl },
        caption: `📘 *Facebook Video (SD)*\n_via ${prefix}${command} • Alya Bot_`,
      }, { quoted: m });

    } catch (err) {
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      replyalya(`❌ Gagal: ${err.message}`);
    }
  },
};
