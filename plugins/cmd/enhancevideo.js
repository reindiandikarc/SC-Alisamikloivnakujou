// Plugin: enhancevideo
// Commands: hdvid, enhancevideo
// Ported from Alya V10 — 1:1 exact behavior

'use strict';

const fs = require('fs');
const { videoenhancer } = require('../../fitur/hdvid');

module.exports = {
  command: ['hdvid', 'enhancevideo'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, replyalya } = ctx;

    if (!m.quoted && !text) {
      return replyalya('Kirim video atau balas video dengan perintah ini!');
    }

    let videoPath = null;
    try {
      // FIX: sama persis V10 — ambil dari quoted atau pesan langsung
      let media    = m.quoted ? m.quoted : m;
      let mimeType = (media.msg || media).mimetype || '';

      if (!mimeType.includes('video')) {
        return replyalya('Yang dikirim bukan video!');
      }

      // FIX: index.js sudah difix, downloadAndSaveMediaMessage sekarang aman
      videoPath = await alya.downloadAndSaveMediaMessage(media);

      await replyalya('⏳ Sedang meningkatkan kualitas video ke HD... Ini mungkin butuh beberapa menit');

      const result = await videoenhancer(videoPath, '4k');

      await alya.sendMessage(m.chat, {
        video  : { url: result.output_url },
        caption: `✅ Video HD siap!\nJob ID: ${result.job_id}`,
      }, { quoted: m });

    } catch (err) {
      console.error('[hdvid]', err?.message || String(err) || 'Unknown error');
      replyalya('❌ Gagal meningkatkan kualitas video.');
    } finally {
      try { if (videoPath && fs.existsSync(videoPath)) fs.unlinkSync(videoPath); } catch {}
    }
  },
};
