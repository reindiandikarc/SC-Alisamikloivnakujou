// Plugin: tohijab
// Commands: hijabkan, tohijab
// 1:1 ported dari Alya V10

'use strict';

const fs = require('fs');
const { live3dEdit } = require('../../lib/live3d');

module.exports = {
  command: ['hijabkan', 'tohijab'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { quoted, mime } = ctx;
    try {
      let biaya  = 10;
      let user   = global.db.users[m.sender];
      let before = user.limit;

      if (before < biaya) {
        return m.reply(`*AKSES DITOLAK*\n\nLimit Anda tidak mencukupi.\n\n• Dibutuhkan: ${biaya}\n• Sisa Limit: ${before}`);
      }

      if (!/image/.test(mime)) return m.reply(`Kirim atau balas gambar dengan perintah:\n*.hijabkan*`);

      const prompt = 'buat karakter ini memakai Hijab';

      await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

      if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp', { recursive: true });
      const media = await alya.downloadAndSaveMediaMessage(quoted);
      const hasil = await live3dEdit(media, prompt);

      user.limit -= biaya;

      await alya.sendMessage(m.chat, {
        image: { url: hasil },
        caption: `*IMAGE EDITOR SUCCESS*\n\n` +
                 `• *Mode:* penghijaban\n` +
                 `• *Biaya:* ${biaya} Limit\n` +
                 `• *Sisa:* ${user.limit} Limit`
      }, { quoted: m });

      fs.unlinkSync(media);
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
      console.error(e);
      m.reply('Gagal memproses gambar. Silakan coba lagi nanti.');
    }
  }
};
