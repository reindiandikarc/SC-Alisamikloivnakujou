// Plugin: brat
// Commands: brat, bratgambar, bratimg
// Exact logic dari Alya V10 — hdr wajib (gagal = error), kirim stiker

'use strict';

module.exports = {
  command: ['brat', 'bratgambar', 'bratimg'],
  tags: ['fun'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, sender, from, reply, replyalya, user } = ctx;

    if (!text) return replyalya(`⚠️ Teksnya mana?\n\n📌 Contoh: *${prefix}${command}* halo dunia`);

    const biaya = 1;
    const userData = user || global.db?.users?.[sender];
    if (!userData) return replyalya('❌ Data user tidak ditemukan. Daftar dulu pakai *.daftar*');
    if ((userData.limit ?? 0) < biaya) {
      return replyalya(`❌ Limit kamu tidak cukup!\n\n💡 Limit dibutuhkan: ${biaya}`);
    }

    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const bratUrl = `https://brat.siputzx.my.id/image?text=${encodeURIComponent(text)}&background=%23ffffff&color=%23000000&emojiStyle=apple`;

    let imageBuffer;
    try {
      const response = await axios.get(bratUrl, { responseType: 'arraybuffer', timeout: 15000 });
      imageBuffer = Buffer.from(response.data, 'binary');
    } catch (err) {
      console.error('[brat.js] Gagal ambil gambar:', err.message);
      return replyalya('❌ Gagal mengambil gambar Brat.');
    }

    // hdr wajib (exact V10) — gagal = return error
    let hdBuffer;
    try {
      const { hdr } = require('../../scrape/iloveimg.js');
      try {
        hdBuffer = await hdr(imageBuffer, 4);
      } catch {
        hdBuffer = await hdr(imageBuffer, 2);
      }
    } catch (err) {
      console.error('[brat.js] Gagal proses hdr:', err.message);
      return replyalya('❌ Gagal memproses gambar ke HD.');
    }

    try {
      await alya.sendImageAsSticker(m.chat, hdBuffer, m, {
        packname: global.packname || global.botname || 'Alya',
        author: global.packname || global.botname || 'Alya',
      });

      userData.limit -= biaya;

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (err) {
      console.error('[brat.js] Gagal kirim stiker:', err.message);
      return replyalya('❌ Gagal mengirim stiker.');
    }
  },
};
