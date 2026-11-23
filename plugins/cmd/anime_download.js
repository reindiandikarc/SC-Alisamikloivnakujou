// Plugin: anime_download
// Commands: anime_download
// Fix V19: Setelah tampilkan link, jika link Mega.nz tersedia
// user bisa langsung download dengan .animedl <url_mega>

'use strict';

module.exports = {
  command: ['anime_download'],
  tags: ['anime'],
  run: async (alya, m, ctx) => {
    const { args, text, prefix, replyalya } = ctx;

    const url = (args[0] || text || '').trim();
    if (!url) return replyalya('❌ URL tidak valid.\n\nContoh: .anime_download https://kusonime.com/...');

    try {
      const { kusonime } = require('../../fitur/kusonime');

      await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

      const { download } = await kusonime.detail(url);

      if (!download || !download.length) {
        return replyalya('❌ Tidak ada link download ditemukan untuk anime ini.');
      }

      // Kumpulkan semua link Mega.nz untuk shortcut
      const megaLinks = [];

      let teks = '⬇️ *LINK DOWNLOAD ANIME*\n\n';
      download.forEach(b => {
        teks += `📦 *${b.title}*\n`;
        for (const r in b.resolutions) {
          teks += `\n🎞️ *${r}*\n`;
          b.resolutions[r].forEach(l => {
            teks += `• ${l.provider}\n${l.url}\n`;
            if (l.url && l.url.includes('mega.nz')) {
              megaLinks.push({ title: b.title, res: r, provider: l.provider, url: l.url });
            }
          });
        }
        teks += '\n';
      });

      teks = teks.trim();

      // Jika ada link Mega.nz, tampilkan shortcut langsung download
      if (megaLinks.length > 0) {
        teks += '\n\n' + '─'.repeat(20) + '\n';
        teks += `📥 *DOWNLOAD LANGSUNG (Mega.nz):*\n`;
        teks += `_Gunakan perintah berikut untuk download file:_\n\n`;
        megaLinks.slice(0, 3).forEach((ml, i) => {
          teks += `${i + 1}. *${ml.res}* — ${ml.provider}\n`;
          teks += `\`.animedl ${ml.url}\`\n\n`;
        });
      }

      teks += '\n⬅️ Kembali: .anime_latest';

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      replyalya(teks);

    } catch (err) {
      console.error('[anime_download]', err.message || err);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      replyalya(`❌ Gagal mengambil data download.\n_${err.message || 'Error tidak diketahui'}_`);
    }
  },
};
