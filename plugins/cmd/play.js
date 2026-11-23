// Plugin: play / songs
// Commands: play, songs
// ✅ 1:1 format V10 — thumbnail image + buttons (bukan dropdown)
// ✅ Durasi format: "245 seconds (4:05)"
// ✅ Footer: Bukan karena aku suka seleramu ya! 😤
// ✅ Button Audio & Video (buttonId → langsung trigger ytmp3/ytmp4)
// ✅ Tanpa link preview di hasil download

'use strict';

const yts = require('yt-search');

module.exports = {
  command: ['play', 'songs'],
  tags: ['downloader'],
  run: async (alya, m, ctx) => {
    const { command, text, prefix, replyalya } = ctx;

    if (!text) {
      return replyalya(
        `Duh, mau dengerin lagu apa sih? Jangan bikin aku nunggu ya! 😤\n\nContoh: ${prefix + command} Silhouette KANA-BOON`
      );
    }

    try {
      await alya.sendMessage(m.chat, { react: { text: '🎧', key: m.key } });

      const nyoba = await yts(text);

      if (!nyoba || !nyoba.all || nyoba.all.length === 0) {
        return replyalya('Lagu apaan itu? Nggak ketemu! Cari yang bener dong! 💢');
      }

      const { url, title, duration, thumbnail, ago, views, author } = nyoba.all[0];

      // Format durasi: "245 seconds (4:05)" — sama persis seperti tampilan di permintaan
      const durasiStr = (duration && typeof duration === 'object' && duration.seconds != null)
        ? `${duration.seconds} seconds (${duration.timestamp || duration.toString()})`
        : (duration ? duration.toString() : 'Unknown');

      const body =
        `🎵 *Nih, Ketemu!* (Jangan GR ya!)\n\n` +
        `📌 *Judul:* ${title}\n` +
        `👤 *Channel:* ${author?.name || 'Unknown'}\n` +
        `⏳ *Durasi:* ${durasiStr}\n` +
        `📅 *Rilis:* ${ago}\n` +
        `👁️ *Views:* ${views}\n\n` +
        `Cepetan pilih mau Audio atau Video, jangan bikin aku nunggu lama-lama! 🙄`;

      // Buttons — sama persis seperti V10 (buttonId langsung trigger command)
      const buttons = [
        {
          buttonId: `${prefix}ytmp3 ${url}`,
          buttonText: { displayText: '🎵 Audio' },
          type: 1
        },
        {
          buttonId: `${prefix}ytmp4 ${url}`,
          buttonText: { displayText: '🎥 Video' },
          type: 1
        }
      ];

      await alya.sendMessage(m.chat, {
        image: { url: thumbnail },
        caption: body,
        footer: 'Bukan karena aku suka seleramu ya! 😤',
        buttons: buttons,
        headerType: 4,
        viewOnce: true
      }, { quoted: m });

    } catch (err) {
      console.error('[play]', err.message);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      replyalya('Hmph, eror kan! Gara-gara kamu nih cari yang aneh-aneh! 💢');
    }
  }
};
