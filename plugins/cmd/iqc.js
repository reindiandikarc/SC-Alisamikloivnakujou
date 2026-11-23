// Plugin: iqc — iPhone Quote Creator
// Commands: iqc
// Exact logic dari Alya V10 — primary: api-faa.my.id/faa/iqc

'use strict';

module.exports = {
  command: ['iqc'],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const {
      prefix, command,
      sender,
      text, q,
      reply, replyalya,
      user,
    } = ctx;

    const teks = (text || q || '').trim();
    if (!teks) {
      await alya.sendMessage(m.chat, { react: { text: '🙄', key: m.key } });
      return replyalya(`Haaah?! Mau bikin quote tapi teksnya kosong? Kamu niat nggak sih?! 💢\n\n📌 Contoh: *${prefix + command}* Halo Cantik`);
    }

    const biaya = 2;
    if (!user) return replyalya('Data user tidak ditemukan!');
    if ((user.limit || 0) < biaya) {
      return replyalya(`Limit kamu habis! Jangan manja deh, beli limit dulu sana! 😒\n\n💡 Butuh ${biaya} limit.`);
    }

    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
      // Primary API: api-faa.my.id (sama persis V10)
      const apiUrl = `https://api-faa.my.id/faa/iqc?prompt=${encodeURIComponent(teks)}`;
      const response = await axios.get(apiUrl, {
        responseType: 'arraybuffer',
        timeout: 20000,
      });

      const buffer = Buffer.from(response.data);

      // Kurangi limit
      user.limit = (user.limit || 0) - biaya;
      const sisa = user.limit;

      await alya.sendMessage(m.chat, {
        image: buffer,
        caption:
          `📱 *iPhone Quote Creator*\n\n` +
          `Nih, udah aku buatin quotenya. Bagus kan? Bukan karena aku peduli ya, cuma kebetulan lagi nggak sibuk aja! 🙄\n\n` +
          `━━━━━━━━━━━━━━━\n` +
          `💸 Pajak : ${biaya} Limit\n` +
          `📊 Sisa : ${sisa}`,
      }, { quoted: m });

      await alya.sendMessage(m.chat, { react: { text: '💖', key: m.key } });

    } catch (err) {
      console.error('[iqc]', err);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      replyalya('Duh, lagi error! Jangan salahin aku ya, salahin tuh diri sendiri! 😤');
    }
  },
};
