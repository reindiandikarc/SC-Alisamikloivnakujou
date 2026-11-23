// Plugin: tofigure3
// Created V20 — AI Figurine Style 3 (chibi/nendoroid style) via live3d.io
// Commands: tofigure3

'use strict';

const fs = require('fs');
const { live3dEdit } = require('../../lib/live3d');

module.exports = {
  command: ['tofigure3'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { quoted, mime, pushname, replyalya, prefix, command } = ctx;

    try {
      const biaya  = 10;
      const user   = global.db.users[m.sender];
      const before = user.limit;

      if (before < biaya) {
        return m.reply(
          `*AKSES DITOLAK*\n\nLimit Anda tidak mencukupi.\n\n• Dibutuhkan: ${biaya}\n• Sisa Limit: ${before}`
        );
      }

      if (!/image/.test(mime)) {
        return m.reply(`Kirim atau balas gambar dengan perintah:\n*.${command}*`);
      }

      // Style 3: Chibi/Nendoroid style figurine
      const prompt =
        `Transform the character in this image into a cute chibi-style nendoroid figurine. ` +
        `The figurine should have a big head, small body, large eyes, and super cute chibi proportions. ` +
        `Placed on a clean white display stand. Realistic figurine photography. ` +
        `Professional toy photography lighting. Collectible quality.`;

      await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

      if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp', { recursive: true });
      const media = await alya.downloadAndSaveMediaMessage(quoted);
      const hasil = await live3dEdit(media, prompt);

      user.limit -= biaya;

      await alya.sendMessage(m.chat, {
        image: { url: hasil },
        caption:
          `*IMAGE EDITOR SUCCESS*\n\n` +
          `• *Mode:* Jadi Figurine Chibi/Nendoroid\n` +
          `• *Biaya:* ${biaya} Limit\n` +
          `• *Sisa:* ${user.limit} Limit`
      }, { quoted: m });

      if (fs.existsSync(media)) fs.unlinkSync(media);
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
      console.error('[tofigure3]', e);
      m.reply('❌ Gagal memproses gambar. Silakan coba lagi nanti.');
    }
  }
};
