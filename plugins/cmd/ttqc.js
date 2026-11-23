// Plugin: ttqc
// Commands: ttqc
// Generate gambar "TikTok Quote Chat" — bubble chat ala tangkapan layar TikTok.
//
// Cara pakai:
//   .ttqc Nama Kamu | Isi chat yang mau ditampilkan
//   (reply foto) .ttqc Nama Kamu | Isi chat   -> pakai foto yang di-reply sebagai avatar
//   .ttqc Isi chat saja                        -> nama dari pushname, avatar dari foto profil sender
//
// Catatan: asset (template png + font) di-download sekali lalu dicache di media/ttqc/.

'use strict';

const { renderTtqc } = require('../../lib/ttqc.js');

module.exports = {
  command: ['ttqc'],
  tags: ['maker'],
  run: async (alya, m, ctx) => {
    const {
      q, text, sender, pushname,
      reply, replyalya,
    } = ctx;

    const raw = (q || text || '').trim();

    if (!raw) {
      return reply(
        '_Format salah!_\n\n' +
        '*.ttqc* Nama | Isi chat\n' +
        '*.ttqc* Isi chat saja (nama otomatis dari nama WA kamu)\n\n' +
        'Bisa juga reply foto untuk dipakai sebagai foto profil pada bubble chat.'
      );
    }

    let username;
    let chatText;

    if (raw.includes('|')) {
      const idx = raw.indexOf('|');
      username = raw.slice(0, idx).trim();
      chatText = raw.slice(idx + 1).trim();
      if (!username) username = pushname || 'User';
      if (!chatText) return reply('_Isi chat tidak boleh kosong setelah tanda "|"_');
    } else {
      username = pushname || 'User';
      chatText = raw;
    }

    try {
      await alya.sendMessage(m.chat, { react: { text: '🎨', key: m.key } });

      // Avatar: prioritas reply gambar -> foto profil sender -> default bawaan renderer
      let avatarSrc;
      const quotedMtype = m.quoted?.mtype || '';

      if (quotedMtype === 'imageMessage') {
        try {
          avatarSrc =
            typeof m.quoted.download === 'function'
              ? await m.quoted.download()
              : await alya.downloadMediaMessage(m.quoted);
        } catch (e) {
          avatarSrc = undefined;
        }
      }

      if (!avatarSrc) {
        try {
          avatarSrc = await alya.profilePictureUrl(sender, 'image');
        } catch (_) {
          avatarSrc = undefined; // fallback ke default di renderer kalau PP private/tidak ada
        }
      }

      const buffer = await renderTtqc({ username, chatText, avatarSrc });

      return alya.sendMessage(
        m.chat,
        { image: buffer, caption: '*「 T T Q C 」*\n\n_Gambar berhasil dibuat!_' },
        { quoted: m }
      );
    } catch (e) {
      console.error('[ttqc] render error:', e.message);
      return replyalya(`❌ Gagal membuat gambar TTQC.\n_${e.message}_`);
    }
  },
};
