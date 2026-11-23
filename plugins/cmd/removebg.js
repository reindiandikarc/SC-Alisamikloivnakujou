// Plugin: removebg / hapusbg
// Commands: removebg, hapusbg
// Hapus background gambar menggunakan Pixelcut API (ported dari Alya V10)

'use strict';

const fs       = require('fs');
const path     = require('path');
const FormData = require('form-data');
const axios    = require('axios');

// ── Method 1: Pixelcut API (via node-fetch / axios) ──────────────────────────
async function removeBgPixelcut(imgPath) {
  const form = new FormData();
  form.append('image', fs.createReadStream(imgPath));
  form.append('format', 'png');
  form.append('model', 'v1');

  const res = await axios.post('https://api2.pixelcut.app/image/matte/v1', form, {
    headers: {
      ...form.getHeaders(),
      'User-Agent'         : 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
      'Accept'             : 'application/json, text/plain, */*',
      'x-locale'           : 'en',
      'x-client-version'   : 'web:pixa.com:4a5b0af2',
      'origin'             : 'https://www.pixa.com',
      'referer'            : 'https://www.pixa.com/',
      'accept-language'    : 'id-ID,id;q=0.9,en-AU;q=0.8,en;q=0.7',
    },
    responseType: 'arraybuffer',
    timeout: 30000,
    maxBodyLength: Infinity,
  });

  if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(res.data);
}

// ── Method 2: removebg.one API ────────────────────────────────────────────────
async function removeBgOne(imgPath) {
  const buf = fs.readFileSync(imgPath);
  const form = new FormData();
  form.append('file', buf, { filename: 'image.jpg', contentType: 'image/jpeg' });

  const { data } = await axios.post('https://removebg.one/api/predict/v2', form, {
    headers: {
      ...form.getHeaders(),
      'user-agent' : 'Mozilla/5.0 (Linux; Android 10)',
      accept       : 'application/json, text/plain, */*',
      platform     : 'PC',
      origin       : 'https://removebg.one',
      referer      : 'https://removebg.one/upload',
    },
    maxBodyLength: Infinity,
    timeout: 30000,
  });

  const cutoutUrl = data?.data?.cutoutUrl;
  if (!cutoutUrl) throw new Error('No cutout URL in response');

  // Download the result image
  const imgRes = await axios.get(cutoutUrl, { responseType: 'arraybuffer', timeout: 30000 });
  return Buffer.from(imgRes.data);
}

// ── Main function: try method 1 → method 2 ───────────────────────────────────
async function removeBg(imgPath) {
  try {
    const buf = await removeBgPixelcut(imgPath);
    if (buf && buf.length > 1000) return buf;
    throw new Error('Result too small');
  } catch (e1) {
    console.log('[removebg] Method 1 gagal:', e1.message, '→ coba Method 2');
    const buf = await removeBgOne(imgPath);
    if (buf && buf.length > 1000) return buf;
    throw new Error('Semua metode gagal');
  }
}

// ── Plugin export ─────────────────────────────────────────────────────────────
module.exports = {
  command: ['removebg', 'hapusbg'],
  tags   : ['tools'],
  run    : async (alya, m, ctx) => {
    const { command, prefix, reply, replyalya, replytolak, quoted, mime, user } = ctx;

    const COST = 3;

    // Cek limit
    const userData = global.db?.users?.[m.sender];
    if (!userData) return replyalya('❌ Data user tidak ditemukan.');
    if ((userData.limit || 0) < COST) {
      return replyalya(
        `❌ *Limit tidak mencukupi!*\n\n` +
        `• Dibutuhkan : ${COST} limit\n` +
        `• Sisa kamu  : ${userData.limit || 0} limit`
      );
    }

    // Cek ada gambar (langsung atau reply)
    const q       = m.quoted ? m.quoted : m;
    const qMime   = (q.msg || q).mimetype || mime || '';
    const hasImage = /image/.test(qMime) || /image/.test(mime);
    if (!hasImage) {
      return replytolak(
        `📸 Kirim atau balas gambar dengan perintah *${prefix}${command}*`
      );
    }

    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    let imgPath = null;
    try {
      imgPath = await alya.downloadAndSaveMediaMessage(q);
      replyalya('⏳ *Menghapus background...*\n_Harap tunggu sekitar 10–20 detik..._');

      const resultBuf = await removeBg(imgPath);

      userData.limit -= COST;

      await alya.sendMessage(m.chat, {
        image  : resultBuf,
        caption:
          `✅ *REMOVEBG SUCCESS*\n\n` +
          `🖼️ Background berhasil dihapus!\n` +
          `💰 *Biaya   :* ${COST} limit\n` +
          `💳 *Sisa    :* ${userData.limit} limit`,
      }, { quoted: m });

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
      console.error('[removebg]', e.message);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

      let errMsg = e.message || 'Unknown error';
      if (errMsg.includes('ECONNREFUSED') || errMsg.includes('timeout'))
        errMsg = 'Server sedang tidak bisa diakses, coba lagi nanti';
      else if (errMsg.includes('HTTP 4'))
        errMsg = 'Request ditolak server — coba gambar lain';

      replyalya(`❌ *Gagal hapus background!*\n\n_${errMsg}_`);
    } finally {
      try { if (imgPath && fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch {}
    }
  },
};
