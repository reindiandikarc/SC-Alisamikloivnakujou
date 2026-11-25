// Plugin: ytmp3
// Commands: ytmp3
// ✅ Port V10 — API hub.ytconvert.org via fitur/youtubedl.js
// ✅ FIX: Tidak ada link preview pada hasil download
// ✅ Audio dikirim bersih tanpa contextInfo link preview

'use strict';

module.exports = {
  command: ['ytmp3'],
  tags: ['downloader'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, replyalya } = ctx;

    if (!text) {
      await alya.sendMessage(m.chat, { react: { text: '🙄', key: m.key } });
      return replyalya(
        `Duh, kamu pelupa banget sih! 😤\nMasukin link YouTube-nya juga dong!\n\nContoh: ${prefix + command} https://youtu.be/...`
      );
    }

    const biaya = 2;
    const limitUser = global.db.users[m.sender]?.limit || 0;

    if (limitUser < biaya) {
      return replyalya(
        `Ih, nggak modal banget sih! 😒\nLimit kamu nggak cukup buat download ini!\n\n` +
        `💳 Butuh: ${biaya}\n📊 Sisa limit kamu: ${limitUser}\n\nSana Buy limit dulu baru balik lagi!`
      );
    }

    try {
      await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

      const { ytmp3 } = require('../../fitur/youtubedl');
      const res = await ytmp3(text);

      if (!res || (!res.buffer && !res.downloadUrl)) {
        throw new Error('Hasil download kosong');
      }

      // ✅ Kirim audio tanpa link preview
      await alya.sendMessage(m.chat, {
        audio: res.buffer || { url: res.downloadUrl },
        mimetype: 'audio/mpeg',
        fileName: (res.title || 'audio') + '.mp3',
        ptt: false
      }, { quoted: m });

      global.db.users[m.sender].limit -= biaya;
      const sisa = global.db.users[m.sender].limit;

      // Notif limit dipotong — pakai pesan biasa bukan reply
      await alya.sendMessage(m.chat, {
        text: `✅ *Download selesai!*\n\n🎵 ${res.title || 'Audio'}\n\n💳 Limit kepotong ${biaya} nih! Sisa: ${sisa}`
      }, { quoted: m });

      await alya.sendMessage(m.chat, { react: { text: '💖', key: m.key } });

    } catch (e) {
      console.error('[ytmp3]', e.message);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      replyalya('Gagal kan... Makanya, kasih link yang bener dong! Bukan karena aku nggak bisa ya! 💢');
    }
  }
};
