// Plugin: tochibi
// Created V20 — AI Chibi Art Style via live3d.io
// Commands: tochibi

'use strict';

const fs = require('fs');
const { live3dEdit } = require('../../lib/live3d');

module.exports = {
  command: ['tochibi'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { quoted, mime, command, replyalya } = ctx;

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

      const prompt =
        `Convert this person/character into a super cute chibi anime art style. ` +
        `Large sparkling eyes, small cute nose, rosy cheeks, big head with small body. ` +
        `Colorful, vibrant, and adorable anime chibi illustration. ` +
        `High quality digital art, clean lines, soft pastel colors.`;

      await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

      if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp', { recursive: true });
      const media = await alya.downloadAndSaveMediaMessage(quoted);
      const hasil = await live3dEdit(media, prompt);

      user.limit -= biaya;

      await alya.sendMessage(m.chat, {
        image: { url: hasil },
        caption:
          `*IMAGE EDITOR SUCCESS*\n\n` +
          `• *Mode:* Jadi Chibi Anime\n` +
          `• *Biaya:* ${biaya} Limit\n` +
          `• *Sisa:* ${user.limit} Limit`
      }, { quoted: m });

      if (fs.existsSync(media)) fs.unlinkSync(media);
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
      console.error('[tochibi]', e);
      m.reply('❌ Gagal memproses gambar. Silakan coba lagi nanti.');
    }
  }
};
