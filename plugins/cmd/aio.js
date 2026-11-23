// Plugin: aio
// Commands: aio
// All In One Downloader — TikTok, Instagram, Facebook, YouTube, Twitter/X, dll.
// API: api.azbry.com
//
// Cara pakai:
//   .aio <link>      -> download manual dari link yang dikirim
//   .aio on          -> aktifkan auto-detect link di chat ini (bot otomatis download
//                        kalau ada yang kirim link tanpa command)
//   .aio off         -> matikan auto-detect link di chat ini
//   .aio status      -> cek status auto-detect di chat ini

'use strict';

const { fetchAio, sendAioResult, isAutoDlEnabled, setAutoDl } = require('../../lib/aioDownloader.js');

module.exports = {
  command: ['aio'],
  tags: ['downloader'],
  run: async (alya, m, ctx) => {
    const { args, text, prefix, command, reply, replyalya, isGroupAdmins, isAdmins, Ryuu, isGroup } = ctx;

    const sub = (args[0] || '').toLowerCase();

    // ── Toggle auto-detect ──────────────────────────────────────────────────
    if (sub === 'on' || sub === 'off' || sub === 'status') {
      // Khusus grup, batasi ke admin/owner biar tidak sembarang member toggle
      if (isGroup && !(isAdmins || isGroupAdmins || Ryuu)) {
        return reply('❌ Hanya admin/owner grup yang bisa mengatur auto-detect AIO.');
      }

      if (sub === 'status') {
        const isOn = isAutoDlEnabled(m.chat);
        return replyalya(
          `🌐 *AIO Auto-Detect*\n\n` +
          `Status saat ini: *${isOn ? '🟢 ON' : '🔴 OFF'}*\n\n` +
          `Gunakan:\n` +
          `• *${prefix}aio on* — Aktifkan auto-detect\n` +
          `• *${prefix}aio off* — Nonaktifkan auto-detect\n\n` +
          `_Kalau ON, bot otomatis download tiap link TikTok/IG/FB/YT/dll yang dikirim tanpa perlu command._`
        );
      }

      const enabled = sub === 'on';
      setAutoDl(m.chat, enabled);
      return reply(
        enabled
          ? '✅ Auto-detect AIO diaktifkan. Kirim link apa saja (TikTok/IG/FB/YT/dll) dan aku otomatis download~'
          : '❌ Auto-detect AIO dimatikan untuk chat ini.'
      );
    }

    // ── Download manual ───────────────────────────────────────────────────
    const url = (text || '').trim();

    if (!url) {
      return reply(
        `┌˚₊ ๑│ ᴀ ɪ ᴏ  ᴅ ᴏ ᴡ ɴ ʟ ᴏ ᴀ ᴅ ᴇ ʀ │๑˚₊ 🎬\n┇ \n` +
        `│ ❌ Masukkan URL yang ingin di-download!\n` +
        `│ *Contoh:* ${prefix + command} https://vt.tiktok.com/xxxxxx\n┇ \n` +
        `└˚₊ ๑ ────────────── ๑˚₊\n\n` +
        `_Atau ketik *${prefix}aio on* untuk aktifkan auto-detect link._`
      );
    }

    if (!/^https?:\/\//i.test(url)) {
      return reply('❌ URL tidak valid. Pastikan diawali https://');
    }

    try {
      await alya.sendMessage(m.chat, { react: { text: '💫', key: m.key } });

      const data = await fetchAio(url);
      await sendAioResult(alya, m, data);

      await alya.sendMessage(m.chat, { react: { text: '⚡', key: m.key } });
    } catch (e) {
      console.error('[aio]', e.message);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      reply(
        `┌˚₊ ๑│ s ʏ s ᴛ ᴇ ᴍ  ᴇ ʀ ʀ ᴏ ʀ │๑˚₊ \n┇ Gagal memproses AIO Downloader:\n┇ ${e.message}\n└˚₊ ๑ ────────────── ๑˚₊`
      );
    }
  },
};
