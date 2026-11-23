// Plugin: hidetag / h
// Commands: hidetag, h
// Fixed V19 — tag semua member tanpa mereka ter-notif
// Support: text, image, video, audio, sticker, document, quoted message
// ✅ FIX: Ganti downloadMediaMessage(fakeObj) → alya.downloadMediaMessage(m.quoted)
//         karena fakeObj bukan WAMessage proto yang valid untuk socketon downloader
// Alias .h → command dispatcher strip prefix "." → command = "h" ✅

'use strict';

module.exports = {
  command: ['hidetag', 'h'],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const {
      q, text,
      isGroup, groupMembers,
      isBotAdmins, isAdmins, Ryuu,
      reply, replyalya, replytolak,
    } = ctx;

    if (!isGroup) return replytolak('Fitur ini hanya bisa digunakan di grup!');
    if (!isAdmins && !Ryuu) return reply('Khusus Admin!!');
    if (!isBotAdmins) return replytolak('_Bot Harus Menjadi Admin Terlebih Dahulu_');

    // ── Bangun mentions dari semua member grup ────────────────
    const members  = Array.isArray(groupMembers) ? groupMembers : [];
    const mentions = members.map(a => {
      if (typeof a === 'string') return a;
      return a.id || a.jid || '';
    }).filter(Boolean);

    // ── Jika ada quoted message ───────────────────────────────
    if (m.quoted) {
      const mtype = m.quoted?.mtype || '';

      // ✅ FIX: Ambil caption/info dari m.quoted langsung (sudah di-flatten oleh smsg)
      const caption     = m.quoted?.caption || m.quoted?.text || q || '';
      const audioMime   = m.quoted?.mimetype || 'audio/mpeg';
      const isPtt       = m.quoted?.ptt || false;
      const docFilename = m.quoted?.fileName || 'file';
      const docMime     = m.quoted?.mimetype || 'application/octet-stream';

      // ✅ FIX: Gunakan alya.downloadMediaMessage(m.quoted) — wrapper yang benar di V19
      //         Fallback ke m.quoted.download() jika tersedia
      const _download = async () => {
        if (typeof m.quoted.download === 'function') {
          return await m.quoted.download();
        }
        return await alya.downloadMediaMessage(m.quoted);
      };

      // IMAGE
      if (mtype === 'imageMessage') {
        try {
          const buffer = await _download();
          return alya.sendMessage(
            m.chat,
            { image: buffer, caption, mentions },
            { quoted: m }
          );
        } catch (e) {
          console.error('[hidetag] download image error:', e.message);
          return replyalya('❌ Gagal download gambar dari quoted.');
        }
      }

      // VIDEO
      if (mtype === 'videoMessage') {
        try {
          const buffer = await _download();
          return alya.sendMessage(
            m.chat,
            { video: buffer, caption, mentions },
            { quoted: m }
          );
        } catch (e) {
          console.error('[hidetag] download video error:', e.message);
          return replyalya('❌ Gagal download video dari quoted.');
        }
      }

      // AUDIO / PTT
      if (mtype === 'audioMessage') {
        try {
          const buffer = await _download();
          return alya.sendMessage(
            m.chat,
            {
              audio: buffer,
              mimetype: audioMime,
              ptt: isPtt,
              mentions,
            },
            { quoted: m }
          );
        } catch (e) {
          console.error('[hidetag] download audio error:', e.message);
          return replyalya('❌ Gagal download audio dari quoted.');
        }
      }

      // STICKER
      if (mtype === 'stickerMessage') {
        try {
          const buffer = await _download();
          return alya.sendMessage(
            m.chat,
            { sticker: buffer, mentions },
            { quoted: m }
          );
        } catch (e) {
          console.error('[hidetag] download sticker error:', e.message);
          return replyalya('❌ Gagal download sticker dari quoted.');
        }
      }

      // DOKUMEN
      if (mtype === 'documentMessage') {
        try {
          const buffer = await _download();
          return alya.sendMessage(
            m.chat,
            {
              document: buffer,
              fileName: docFilename,
              mimetype: docMime,
              mentions,
            },
            { quoted: m }
          );
        } catch (e) {
          console.error('[hidetag] download document error:', e.message);
          return replyalya('❌ Gagal download dokumen dari quoted.');
        }
      }

      // TEKS — ambil dari m.quoted.text (sudah di-set oleh smsg)
      const quotedText = m.quoted?.text || m.quoted?.caption || '';
      if (quotedText) {
        return alya.sendMessage(
          m.chat,
          { text: quotedText, mentions },
          { quoted: m }
        );
      }
    }

    // ── Tidak ada quoted / pesan biasa ────────────────────────
    const msgText = text || q || '';
    if (!msgText) {
      return replyalya('_Tulis pesan atau reply pesan yang ingin di-hidetag!_\n\nContoh: `.h halo semua` atau reply pesan lalu `.h`');
    }

    return alya.sendMessage(
      m.chat,
      { text: msgText, mentions },
      { quoted: m }
    );
  },
};
