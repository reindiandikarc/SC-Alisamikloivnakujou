// Plugin: hdr
// Commands: hdr
// HD enhance gambar via Supawork AI (iloveimg fallback)
// FIX: Cannot read properties of undefined (reading 'message')
//      → quoted dari ctx = m.quoted || m (selalu truthy), cek media via m.quoted dulu

'use strict';

const fs = require('fs');

module.exports = {
  command: ['hdr'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { prefix, command, pushname, quoted, mime, reply, replyalya, replytolak } = ctx;

    // ── Validasi: harus ada media yang di-quote ──────────────────────────────
    // Di V19, quoted = m.quoted ?? m (fallback ke m sendiri).
    // Jadi cek m.quoted dulu; kalau tidak ada, tidak ada media yang di-reply.
    if (!m.quoted) {
      return replytolak(`📸 Reply gambar dengan perintah *${prefix + command}*\n\n_Contoh: Reply foto → ketik .hdr_`);
    }

    // mime sudah dihitung dari quoted (m.quoted atau m), cukup cek langsung
    const qMime = (m.quoted.msg || m.quoted).mimetype || mime || '';
    if (!/image/.test(qMime) && !/webp/.test(qMime)) {
      return replytolak(`❌ Yang di-reply harus berupa *gambar/foto*`);
    }

    const COST = 3;
    const userData = global.db?.users?.[m.sender];
    if (!userData) return replyalya('❌ Data user tidak ditemukan.');
    if ((userData.limit || 0) < COST) {
      return replyalya(
        `❌ *Limit Tidak Cukup!*\n\n` +
        `💳 Dibutuhkan : ${COST} Limit\n` +
        `📊 Limit Kamu : ${userData.limit || 0}\n\n` +
        `⚠️ Silakan topup dengan *.buy*`
      );
    }

    await alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });
    replyalya(
      `⏳ *Sedang memperjerlas gambar...*\n\n` +
      `👤 User   : ${pushname}\n` +
      `🧠 Engine : Supawork AI Enhancer\n` +
      `📤 Status : Processing...\n\n` +
      `_Mohon tunggu ±15-30 detik_`
    );

    let imgPath = null;
    try {
      const { imgupscale } = require('../../fitur/hd');

      imgPath = await alya.downloadAndSaveMediaMessage(m.quoted);
      const buffer = fs.readFileSync(imgPath);

      // Coba scale 4x dulu, fallback ke 2x jika gagal
      let resultUrl;
      try {
        resultUrl = await imgupscale(buffer, { scale: 4 });
      } catch (e1) {
        console.warn('[hdr] scale 4x gagal, coba 2x:', e1.message);
        resultUrl = await imgupscale(buffer, { scale: 2 });
      }

      userData.limit -= COST;

      await alya.sendMessage(m.chat, {
        image: { url: resultUrl },
        caption:
          `✨ *GAMBAR HD BERHASIL!*\n\n` +
          `👤 Request By : ${pushname}\n` +
          `🖼️ Mode       : HD Enhance\n` +
          `🧠 Engine     : Supawork AI\n\n` +
          `━━━━━━━━━━━━━━━\n` +
          `💳 Biaya  : -${COST} Limit\n` +
          `📊 Sisa   : ${userData.limit} Limit`
      }, { quoted: m });

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
      const errMsg = e?.message || String(e) || 'Unknown error';
      console.error('[hdr]', errMsg);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

      // Fallback: iloveimg
      try {
        const { hdr } = require('../../scrape/iloveimg.js');
        const buffer = imgPath && fs.existsSync(imgPath)
          ? fs.readFileSync(imgPath)
          : await m.quoted.download();

        const userData2 = global.db?.users?.[m.sender];
        const result = await hdr(buffer, 2);

        if (userData2) userData2.limit -= COST;

        await alya.sendMessage(m.chat, {
          image: result,
          caption:
            `✨ *GAMBAR HD BERHASIL! (Fallback)*\n\n` +
            `👤 Request By : ${pushname}\n` +
            `🖼️ Mode       : HD Enhance\n\n` +
            `━━━━━━━━━━━━━━━\n` +
            `💳 Biaya  : -${COST} Limit\n` +
            `📊 Sisa   : ${userData2?.limit || 0} Limit`
        }, { quoted: m });

        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      } catch (e2) {
        const errMsg2 = e2?.message || String(e2) || 'Unknown error';
        console.error('[hdr fallback]', errMsg2);
        replyalya(`❌ *Gagal enhance gambar!*\n\n_${errMsg}_`);
      }
    } finally {
      try { if (imgPath && fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch {}
    }
  },
};
