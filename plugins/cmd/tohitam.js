// Plugin: tohitam
// Commands: tohitam, hitamkan
// FIX: quoted check pakai m.quoted (bukan ctx.quoted yang fallback ke m)
//      + dedup lock agar tidak proses 2x

'use strict';

const fs = require('fs');
const { live3dEdit } = require('../../lib/live3d');

// Lock per-message agar tidak proses 2x
const _lock = new Set();

module.exports = {
  command: ['tohitam', 'hitamkan'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { replytolak } = ctx;

    // Dedup: satu pesan hanya diproses sekali
    const msgKey = m.key?.id || `${m.chat}_${m.messageTimestamp}`;
    if (_lock.has(msgKey)) return;
    _lock.add(msgKey);
    setTimeout(() => _lock.delete(msgKey), 60000);

    try {
      const user   = global.db.users[m.sender];
      const biaya  = 10;
      const before = user?.limit || 0;

      if (before < biaya) {
        return m.reply(`*AKSES DITOLAK*\n\nLimit Anda tidak mencukupi.\n\n• Dibutuhkan: ${biaya}\n• Sisa Limit: ${before}`);
      }

      // FIX: Cek m.quoted, bukan ctx.quoted (ctx.quoted = m.quoted || m, selalu truthy)
      if (!m.quoted) {
        return replytolak('📸 Kirim atau balas gambar dengan perintah:\n*.tohitam*');
      }

      const qMime = (m.quoted.msg || m.quoted).mimetype || '';
      if (!/image/.test(qMime) && !/webp/.test(qMime)) {
        return replytolak('❌ Yang di-reply harus berupa gambar/foto!');
      }

      const prompt = 'ubah karakter ini berkulit hitam sehitam hitamnya';

      await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

      if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp', { recursive: true });

      const media = await alya.downloadAndSaveMediaMessage(m.quoted);
      const hasil = await live3dEdit(media, prompt);

      user.limit -= biaya;

      await alya.sendMessage(m.chat, {
        image: { url: hasil },
        caption: `*IMAGE EDITOR SUCCESS*\n\n` +
                 `• *Mode:* Penghitaman\n` +
                 `• *Biaya:* ${biaya} Limit\n` +
                 `• *Sisa:* ${user.limit} Limit`
      }, { quoted: m });

      try { fs.unlinkSync(media); } catch {}
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
      console.error('[tohitam]', e.message);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      m.reply('Gagal memproses gambar. Silakan coba lagi nanti.');
    } finally {
      // Bersihkan lock setelah selesai
      _lock.delete(msgKey);
    }
  }
};
