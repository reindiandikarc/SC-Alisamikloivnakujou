// Plugin: emi-ai
// Commands: emi-ai, emi, claude-ai, costume-ai
// AI Image Generator aliases — Fixed V13
'use strict';

const CreateImg = require('../../lib/createimg');

module.exports = {
  command: ['emi-ai', 'emi', 'claude-ai', 'costume-ai', 'costume'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, reply, replyalya } = ctx;

    if (!text) return replyalya(
      `🎨 *AI Image Generator*\n\nContoh:\n${prefix}${command} a beautiful anime girl in traditional costume`
    );

    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
      let img;
      if (typeof CreateImg?.create === 'function') {
        img = await CreateImg.create(text);
      } else if (typeof CreateImg === 'function') {
        img = await CreateImg(text);
      } else {
        throw new Error('CreateImg tidak tersedia');
      }

      if (!img) throw new Error('Gambar kosong');

      const buf = Buffer.isBuffer(img) ? img : Buffer.from(img, 'base64');
      await alya.sendMessage(m.chat, {
        image: buf,
        caption: `🎨 *AI Image*\n\n> ${text}`,
      }, { quoted: m });

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
      console.error(`[${command}.js] Error:`, err.message);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      replyalya('❌ Gagal generate gambar. Coba lagi nanti ya!');
    }
  },
};
