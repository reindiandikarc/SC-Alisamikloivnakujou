// Plugin: imageedit
// Commands: tohitam, hitamkan, toputih, putihkan, tohijab, hijabkan, tofigure
// Ported from Alya V10 — Image editing via live3d.io API

'use strict';

const axios    = require('axios');
const crypto   = require('crypto');
const fs       = require('fs');
const FormData = require('form-data');
const CryptoJS = require('crypto-js');

// ═══════════════════════════════════════════
// ── Shared Live3D Helper (satu engine semua) ──
// ═══════════════════════════════════════════
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCwlO+boC6cwRo3UfXVBadaYwcX
0zKS2fuVNY2qZ0dgwb1NJ+/Q9FeAosL4ONiosD71on3PVYqRUlL5045mvH2K9i8b
AFVMEip7E6RMK6tKAAif7xzZrXnP1GZ5Rijtqdgwh+YmzTo39cuBCsZqK9oEoeQ3
r/myG9S+9cR5huTuFQIDAQAB
-----END PUBLIC KEY-----`;

function randomString(len) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let res = '';
  for (let i = 0; i < len; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
  return res;
}

function aesenc(data, key) {
  const k = CryptoJS.enc.Utf8.parse(key);
  return CryptoJS.AES.encrypt(data, k, {
    iv: k, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7
  }).toString();
}

function rsaenc(data) {
  const buffer = Buffer.from(data, 'utf8');
  return crypto.publicEncrypt(
    { key: PUBLIC_KEY, padding: crypto.constants.RSA_PKCS1_PADDING },
    buffer
  ).toString('base64');
}

function genHeaders(fp = null) {
  const i = randomString(16);
  const s = rsaenc(i);
  return {
    'User-Agent'     : 'Mozilla/5.0',
    'Accept'         : 'application/json, text/plain, */*',
    'Accept-Language': 'id,en-US;q=0.9,en;q=0.8',
    'origin'         : 'https://live3d.io',
    'referer'        : 'https://live3d.io/',
    'theme-version'  : '83EmcUoQTUv50LhNx0VrdcK8rcGexcP35FcZDcpgWsAXEyO4xqL5shCY6sFIWB2Q',
    'fp'             : fp,
    'fp1'            : aesenc(`aifaceswap:${fp}`, i),
    'x-guide'        : s,
    'x-sign'         : aesenc(`aifaceswap:1H5tRtzsBkqXcaJ:${Date.now()}:${randomString(8)}:${s}`, i),
    'x-code'         : Date.now().toString(),
  };
}

async function uploadImage(localPath) {
  const fp   = crypto.randomBytes(16).toString('hex');
  const form = new FormData();
  form.append('file',         fs.createReadStream(localPath));
  form.append('fn_name',      'demo-image-editor');
  form.append('request_from', '9');
  form.append('origin_from',  '8f3f0c7387123ae0');
  const res = await axios.post(
    'https://app-v1.live3d.io/aitools/upload-img',
    form,
    { headers: { ...genHeaders(fp), ...form.getHeaders() } }
  );
  return { path: res.data.data.path, fp };
}

async function createJob(imgPath, prompt, fp) {
  const payload = {
    fn_name      : 'demo-image-editor',
    call_type    : 3,
    input        : {
      model         : 'nano_banana_2',
      source_images : [imgPath],
      prompt,
      aspect_radio  : 'auto',
      request_from  : 9,
    },
    request_from : 9,
    origin_from  : '8f3f0c7387123ae0',
  };
  const res = await axios.post(
    'https://app-v1.live3d.io/aitools/of/create',
    payload,
    { headers: { ...genHeaders(fp), 'Content-Type': 'application/json' } }
  );
  return res.data.data.task_id;
}

async function checkJob(taskId, fp) {
  const res = await axios.post(
    'https://app-v1.live3d.io/aitools/of/check-status',
    {
      task_id      : taskId,
      fn_name      : 'demo-image-editor',
      call_type    : 3,
      request_from : 9,
      origin_from  : '8f3f0c7387123ae0',
    },
    { headers: { ...genHeaders(fp), 'Content-Type': 'application/json' } }
  );
  return res.data.data;
}

async function live3dEdit(localImg, prompt) {
  const upload  = await uploadImage(localImg);
  const taskId  = await createJob(upload.path, prompt, upload.fp);
  let result;
  let attempts  = 0;
  do {
    await new Promise(r => setTimeout(r, 4000));
    result = await checkJob(taskId, upload.fp);
    if (++attempts > 30) throw new Error('Live3D timeout — coba lagi nanti');
  } while (result.status !== 2);
  return 'https://temp.live3d.io/' + result.result_image;
}

// ── Shared handler untuk semua mode edit ──
async function handleImageEdit(alya, m, ctx, { prompt, modeName, emoji }) {
  const { reply, replyalya, quoted, mime, user } = ctx;
  const COST = 10;

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

  // Cek ada media
  const hasImage = /image/.test(mime) || (quoted && /image/.test(quoted?.mimetype || ''));
  if (!hasImage) {
    return replyalya(
      `${emoji} *Kirim atau balas gambar* untuk menggunakan fitur ini.\n\n` +
      `_Contoh: kirim foto lalu ketik perintahnya_`
    );
  }

  await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

  let mediaPath = null;
  try {
    // Download gambar (bisa dari pesan langsung atau quoted)
    mediaPath = await alya.downloadAndSaveMediaMessage(quoted || m);

    replyalya(
      `${emoji} *Sedang memproses...*\n\n` +
      `• Mode   : ${modeName}\n` +
      `• Biaya  : ${COST} limit\n\n` +
      `_Harap tunggu 15–30 detik..._`
    );

    const hasil = await live3dEdit(mediaPath, prompt);

    userData.limit -= COST;

    await alya.sendMessage(m.chat, {
      image  : { url: hasil },
      caption:
        `✅ *IMAGE EDITOR SUCCESS*\n\n` +
        `${emoji} *Mode   :* ${modeName}\n` +
        `💰 *Biaya  :* ${COST} limit\n` +
        `💳 *Sisa   :* ${userData.limit} limit`,
    }, { quoted: m });

    await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (e) {
    console.error(`[imageedit:${modeName}]`, e.message);
    await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

    let errMsg = e.message || 'Unknown error';
    if (errMsg.includes('timeout'))         errMsg = 'Server AI sedang sibuk, coba lagi nanti';
    else if (errMsg.includes('status 5'))   errMsg = 'Server live3d.io bermasalah';
    else if (errMsg.includes('status 4'))   errMsg = 'Request ditolak API — coba gambar lain';

    replyalya(`❌ *Gagal memproses!*\n\n_${errMsg}_`);
  } finally {
    try { if (mediaPath && fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath); } catch {}
  }
}

// ═══════════════════════════════════════════
// ── PLUGIN EXPORT (semua command dalam 1 file) ──
// ═══════════════════════════════════════════
module.exports = [

  // ── 1. TOHITAM ──
  {
    command: ['tohitam', 'hitamkan'],
    tags   : ['ai'],
    run    : async (alya, m, ctx) => handleImageEdit(alya, m, ctx, {
      prompt  : 'ubah karakter ini berkulit hitam sehitam hitamnya',
      modeName: 'Penghitaman Kulit',
      emoji   : '🖤',
    }),
  },

  // ── 2. TOPUTIH ──
  {
    command: ['toputih', 'putihkan'],
    tags   : ['ai'],
    run    : async (alya, m, ctx) => handleImageEdit(alya, m, ctx, {
      prompt  : 'ubah karakter ini berkulit normal dengan warna putih',
      modeName: 'Pemutihan Kulit',
      emoji   : '🤍',
    }),
  },

  // ── 3. TOHIJAB ──
  {
    command: ['tohijab', 'hijabkan'],
    tags   : ['ai'],
    run    : async (alya, m, ctx) => handleImageEdit(alya, m, ctx, {
      prompt  : 'buat karakter ini memakai Hijab',
      modeName: 'Penghijaban',
      emoji   : '🧕',
    }),
  },

  // ── 4. TOFIGURE ──
  {
    command: ['tofigure'],
    tags   : ['ai'],
    run    : async (alya, m, ctx) => handleImageEdit(alya, m, ctx, {
      prompt  :
        `Using the model, create a 1/7 scale commercialized figurine of the characters in the picture, in a realistic style, in a real environment. ` +
        `The figurine is placed on a computer desk. ` +
        `The figurine has a round transparent acrylic base, with no text on the base. ` +
        `The content on the computer screen is the ZBrush modeling process of this figurine. ` +
        `Next to the computer screen is a BANDAI-style toy packaging box printed with the original artwork. ` +
        `The packaging features two-dimensional flat illustrations`,
      modeName: 'Jadi Figurin',
      emoji   : '🧸',
    }),
  },

  // ── 5. TOCHIBBI ──
  {
    command: ['tochibbi', 'chibbi', 'jadichibbi'],
    tags   : ['ai'],
    run    : async (alya, m, ctx) => handleImageEdit(alya, m, ctx, {
      prompt  : 'buat orang/karakter ini menjadi karakter versi chibby nya tanpa mengubah style pakaiannya',
      modeName: 'Jadi Chibby',
      emoji   : '🧒',
    }),
  },

  // ── 6. TOMAID ──
  {
    command: ['tomaid', 'jadibabu'],
    tags   : ['ai'],
    run    : async (alya, m, ctx) => handleImageEdit(alya, m, ctx, {
      prompt  : 'buat karakter ini memakai baju maid lengkap dengan bando dan lainnya',
      modeName: 'Menjadi Babu',
      emoji   : '🎀',
    }),
  },

  // ── 7. TOBOTAK ──
  {
    command: ['tobotak', 'botakin'],
    tags   : ['ai'],
    run    : async (alya, m, ctx) => handleImageEdit(alya, m, ctx, {
      prompt  : 'buat karakter ini tidak memiliki rambut atau jadikan karakter ini botak',
      modeName: 'Pembotakan',
      emoji   : '👨\u200d🦲',
    }),
  },

  // ── 8. TOZOMBIE ──
  {
    command: ['tozombie', 'jadizombie'],
    tags   : ['ai'],
    run    : async (alya, m, ctx) => handleImageEdit(alya, m, ctx, {
      prompt  : 'ubah karakter/orang ini menjadi zombie, dengan kulit busuk, mata putih, dan luka-luka khas zombie yang terlihat nyata',
      modeName: 'Jadi Zombie',
      emoji   : '🧟',
    }),
  },

];
