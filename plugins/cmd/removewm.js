// Plugin: removewm / unwm / hapuswm
// Commands: removewm, unwm, hapuswm
// Hapus watermark dari gambar menggunakan EZRemove API (ported dari script standalone)

'use strict';

const fs   = require('fs');
const path = require('path');
const axios = require('axios');

const UA     = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36';
const ORIGIN = 'https://ezremove.ai';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getMime(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  return 'application/octet-stream';
}

// ── Method 1: EZRemove API (job-based watermark removal) ─────────────────────
async function removeWatermarkEzremove(filePath) {
  const filename = path.basename(filePath);
  const buffer   = fs.readFileSync(filePath);
  const mime     = getMime(filePath);
  const boundary = `----FormBoundary${Math.random().toString(36).slice(2)}`;

  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="image_file"; filename="${filename}"\r\nContent-Type: ${mime}\r\n\r\n`),
    buffer,
    Buffer.from(`\r\n--${boundary}--\r\n`)
  ]);

  const create = await axios.post(
    'https://api.ezremove.ai/api/ez-remove/watermark-remove/create-job',
    body,
    {
      headers: {
        'User-Agent'      : UA,
        'Accept'          : 'application/json, text/plain, */*',
        'Origin'          : ORIGIN,
        'Referer'         : `${ORIGIN}/`,
        'product-serial'  : `sr-${Date.now()}`,
        'Content-Type'    : `multipart/form-data; boundary=${boundary}`,
        'Content-Length'  : body.length
      },
      timeout: 30000,
      validateStatus: () => true,
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    }
  );

  if (create.status < 200 || create.status >= 300) {
    throw new Error(`Create job gagal (HTTP ${create.status})`);
  }

  const jobId = create.data?.result?.job_id;
  if (!jobId) throw new Error('Job ID tidak ditemukan dari response');

  for (let i = 0; i < 30; i++) {
    await sleep(2000);

    const check = await axios.get(
      `https://api.ezremove.ai/api/ez-remove/watermark-remove/get-job/${jobId}`,
      {
        headers: {
          'User-Agent'    : UA,
          'Accept'        : 'application/json, text/plain, */*',
          'Origin'        : ORIGIN,
          'Referer'       : `${ORIGIN}/`,
          'product-serial': `sr-${Date.now()}`
        },
        timeout: 15000,
        validateStatus: () => true
      }
    );

    if (check.status < 200 || check.status >= 300) {
      throw new Error(`Cek job gagal (HTTP ${check.status})`);
    }

    const resultUrl = check.data?.result?.output?.[0];

    if (check.data?.code === 100000 && resultUrl) {
      const imgRes = await axios.get(resultUrl, { responseType: 'arraybuffer', timeout: 30000 });
      return Buffer.from(imgRes.data);
    }

    // code 300001 = masih diproses, lanjut polling
    if (check.data?.code !== 300001) {
      throw new Error(`Job gagal diproses (code ${check.data?.code})`);
    }
  }

  throw new Error('Timeout menunggu hasil (proses terlalu lama)');
}

// ── Plugin export ─────────────────────────────────────────────────────────────
module.exports = {
  command: ['removewm', 'unwm', 'hapuswm'],
  tags: ['tools'],
  help: ['removewm (reply/kirim gambar) - hapus watermark dari gambar'],
  owner: false,
  admin: false,
  group: false,
  private: false,
  premium: false,
  limit: true,
  register: false,

  run: async (alya, m, ctx) => {
    const { command, prefix, reply, replyalya, replytolak, quoted, mime } = ctx;

    const COST = 3;

    const userData = global.db?.users?.[m.sender];
    if (!userData) return replyalya('❌ Data user tidak ditemukan.');
    if ((userData.limit || 0) < COST) {
      return replyalya(
        `❌ *Limit tidak mencukupi!*\n\n` +
        `• Dibutuhkan : ${COST} limit\n` +
        `• Sisa kamu  : ${userData.limit || 0} limit`
      );
    }

    const q       = m.quoted ? m.quoted : m;
    const qMime   = (q.msg || q).mimetype || mime || '';
    const hasImage = /image/.test(qMime) || /image/.test(mime || '');
    if (!hasImage) {
      return replytolak(
        `🖼️ Kirim atau balas gambar ber-watermark dengan perintah *${prefix}${command}*`
      );
    }

    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    let imgPath = null;
    try {
      imgPath = await alya.downloadAndSaveMediaMessage(q);
      replyalya('⏳ *Menghapus watermark...*\n_Proses bisa memakan waktu 30–60 detik..._');

      const resultBuf = await removeWatermarkEzremove(imgPath);

      userData.limit -= COST;

      await alya.sendMessage(m.chat, {
        image  : resultBuf,
        caption:
          `✅ *REMOVE WATERMARK SUCCESS*\n\n` +
          `🖼️ Watermark berhasil dihapus!\n` +
          `💰 *Biaya   :* ${COST} limit\n` +
          `💳 *Sisa    :* ${userData.limit} limit`,
      }, { quoted: m });

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
      console.error('[removewm]', e.message);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

      let errMsg = e.message || 'Unknown error';
      if (errMsg.includes('ECONNREFUSED') || errMsg.includes('timeout'))
        errMsg = 'Server sedang tidak bisa diakses, coba lagi nanti';
      else if (errMsg.includes('HTTP 4'))
        errMsg = 'Request ditolak server — coba gambar lain';

      replyalya(`❌ *Gagal hapus watermark!*\n\n_${errMsg}_`);
    } finally {
      try { if (imgPath && fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch {}
    }
  },
};
