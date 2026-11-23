// Plugin: hapusbg
// Commands: removebg, hapusbg

'use strict';

const path   = require('path');
const fs     = require('fs');
const RemoveBG = require('../../fitur/removebg');

module.exports = {
  command: ['removebg', 'hapusbg'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const {
      command, prefix,
      quoted, mime,
      replyalya, replytolak,
    } = ctx;

    const biaya     = 3;
    const userData  = global.db.users[m.sender];
    const limitUser = userData?.limit || 0;

    if (limitUser < biaya) {
      return replyalya(
        `❌ *Limit kamu tidak cukup!*\n\n` +
        `💳 Dibutuhkan : ${biaya}\n` +
        `📊 Sisa Limit : ${limitUser}`
      );
    }

    // FIX #3: gunakan 'quoted' (message object) bukan 'q' (string teks)
    // FIX: cek mime dari quoted ATAU pesan langsung (sama seperti V10)
    const hasImage = /image/.test(mime);
    if (!hasImage) {
      return replytolak(`📸 Kirim atau reply gambar dengan perintah *${prefix + command}*`);
    }

    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    let imgPath = null;
    try {
      userData.limit -= biaya;

      // FIX: download dari 'quoted' (bisa pesan langsung atau quoted image)
      imgPath = await alya.downloadAndSaveMediaMessage(quoted);
      const hasil = await RemoveBG(imgPath);

      await alya.sendMessage(
        m.chat,
        {
          image  : hasil,
          caption:
            `✅ *Background berhasil dihapus!*\n\n` +
            `💳 Limit terpakai : ${biaya}\n` +
            `📊 Sisa limit     : ${userData.limit}`,
        },
        { quoted: m }
      );

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
      userData.limit += biaya; // rollback limit jika gagal
      console.error('[removebg]', err.message);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      replyalya(`❌ *Gagal menghapus background.*\n_${err.message}_`);
    } finally {
      try { if (imgPath && fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch {}
    }
  },
};
