// Plugin: animedl
// Commands: animedl, adl
// Support:
//   ✅ Mega.nz (file/folder) — download & kirim sebagai dokumen
//   ✅ Desustream safelink — resolve & forward ke Mega/dll
//   ✅ Pixeldrain — download & kirim dokumen
//   ✅ GoFile, BuzzHeavier, KrakenFiles — link langsung
//   ✅ Direct MP4/MKV/WEBM — download & kirim dokumen
//   ✅ URL lain (GDrive, Mediafire, dll) — kirim info link

'use strict';

const path = require('path');
const axios = require('axios');

// ─── Desustream / Safelink Resolver ──────────────────────────────────────────
// Strategi berlapis: redirect → HTML parsing → atob decode → meta refresh
async function resolveDesustream(inputUrl) {
  const headers = {
    'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
    'Referer':         'https://desustream.me/',
    'Cache-Control':   'no-cache',
  };

  let html = '';
  let finalRedirectUrl = inputUrl;

  // STRATEGI 1: Follow redirect — ambil HTML akhir
  try {
    const resp = await axios.get(inputUrl, {
      headers,
      maxRedirects: 10,
      timeout: 20000,
      validateStatus: s => s < 500,
    });
    html = typeof resp.data === 'string' ? resp.data : '';
    finalRedirectUrl = resp.request?.res?.responseUrl || resp.config?.url || inputUrl;

    // Jika sudah langsung redirect ke Mega/dll
    if (
      finalRedirectUrl !== inputUrl &&
      (finalRedirectUrl.includes('mega.nz') || finalRedirectUrl.match(/\.(mp4|mkv|webm)/i))
    ) {
      return finalRedirectUrl;
    }
  } catch (e) {
    console.warn('[animedl:resolve] Axios gagal:', e.message);
  }

  // STRATEGI 2: atob() decode (paling umum di desustream)
  // Cari: var url = atob("...") atau const link = atob("...")
  const atobVarMatch = html.match(
    /(?:var|let|const)\s+(?:url|link|href|target|finalUrl|dlurl|download)\s*=\s*atob\(\s*['"]([A-Za-z0-9+/=]+)['"]\s*\)/i
  );
  if (atobVarMatch) {
    try {
      const decoded = Buffer.from(atobVarMatch[1], 'base64').toString('utf-8');
      if (decoded.startsWith('http')) return decoded;
    } catch {}
  }

  // STRATEGI 3: Semua atob() calls — cek satu per satu
  const allAtob = [...html.matchAll(/atob\(\s*['"]([A-Za-z0-9+/=]{20,})['"](?:\s*\+\s*['"][^'"]*['"])?\s*\)/gi)];
  for (const match of allAtob) {
    try {
      const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
      if (decoded.includes('mega.nz') || decoded.startsWith('https://')) {
        return decoded;
      }
    } catch {}
  }

  // STRATEGI 4: Parse HTML patterns — prioritas tinggi ke rendah
  const patterns = [
    // window.location redirect
    /window\.location(?:\.href)?\s*=\s*['"]([^'"]+)['"]/i,
    // direct mega.nz link (href)
    /href=['"]?(https?:\/\/mega\.nz\/[^\s"'<>]+)['"]?/i,
    // mega.nz in plain text / JS
    /https?:\/\/mega\.nz\/(?:file|folder)\/[A-Za-z0-9#!_\-]+/,
    // meta refresh redirect
    /<meta[^>]+http-equiv=['"]refresh['"][^>]+content=['"][^;]+;\s*url=([^'">\s]+)/i,
    // data-url / data-href attributes
    /data-(?:url|href|link|src)=['"]?(https?:\/\/[^'">\s]+)['"]?/i,
    // onclick URL
    /onclick=[^>]*['"]https?:\/\/(?:mega\.nz|pixeldrain\.com)[^'"<>]+['"]/i,
    // pixeldrain
    /href=['"]?(https?:\/\/pixeldrain\.com\/[^\s"'<>]+)['"]?/i,
    // direct video file link
    /https?:\/\/[^\s"'<>]+\.(?:mp4|mkv|webm|m4v)(?:\?[^\s"'<>]*)?/i,
    // gofile / buzzheavier / krakenfiles
    /https?:\/\/(?:gofile\.io|buzzheavier\.com|krakenfiles\.com)\/[^\s"'<>]+/i,
  ];

  for (const pat of patterns) {
    const match = html.match(pat);
    if (match) {
      const found = match[1] || match[0];
      if (found && found.startsWith('http') && found !== inputUrl) return found;
    }
  }

  // STRATEGI 5: Coba URL dengan query param `url=` atau `link=`
  try {
    const urlObj   = new URL(inputUrl);
    const paramUrl = urlObj.searchParams.get('url') || urlObj.searchParams.get('link') || urlObj.searchParams.get('id');
    if (paramUrl) {
      const dec = decodeURIComponent(paramUrl);
      if (dec.startsWith('http')) return dec;
      // Coba base64
      try {
        const b64 = Buffer.from(paramUrl, 'base64').toString('utf-8');
        if (b64.startsWith('http')) return b64;
      } catch {}
    }
  } catch {}

  // STRATEGI 6: POST request — beberapa safelink perlu POST untuk generate link
  try {
    const urlObj  = new URL(inputUrl);
    const postUrl = inputUrl;
    const postResp = await axios.post(postUrl, 'go=go', {
      headers: {
        ...headers,
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
      },
      timeout: 15000,
      maxRedirects: 5,
      validateStatus: s => s < 500,
    });
    const postHtml = typeof postResp.data === 'string' ? postResp.data : JSON.stringify(postResp.data);
    // Cari mega link dari response
    const megaInPost = postHtml.match(/https?:\/\/mega\.nz\/[A-Za-z0-9#!\/\-_]+/);
    if (megaInPost) return megaInPost[0];
    // Cari URL dari JSON response
    if (postResp.data?.url)  return postResp.data.url;
    if (postResp.data?.link) return postResp.data.link;
  } catch {}

  // Tidak berhasil resolve
  return null;
}

// ─── Mime map ──────────────────────────────────────────────────────────────────
const MIME_MAP = {
  mp4: 'video/mp4',     mkv: 'video/x-matroska',  webm: 'video/webm',
  avi: 'video/x-msvideo', m4v: 'video/mp4',
  mp3: 'audio/mpeg',    flac: 'audio/flac',        m4a: 'audio/mp4',
  zip: 'application/zip', rar: 'application/x-rar-compressed',
  '7z': 'application/x-7z-compressed',
  pdf: 'application/pdf',
  apk: 'application/vnd.android.package-archive',
  txt: 'text/plain',
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
};

function getMime(filename) {
  const ext = path.extname(filename || '').slice(1).toLowerCase();
  return MIME_MAP[ext] || 'application/octet-stream';
}

// ─── Kirim sebagai dokumen (BUKAN video) ──────────────────────────────────────
async function sendAsDocument(alya, m, buffer, filename, sizeMB, source) {
  const mime = getMime(filename);
  await alya.sendMessage(m.chat, {
    document: buffer,
    fileName: filename,
    mimetype: mime,
    caption:
      `✅ *${filename}*\n` +
      `📦 ${sizeMB || '?'} MB\n` +
      `🔗 _Sumber: ${source || 'Anime DL'}_\n` +
      `\n_Powered by Alya Bot Anime DL_`,
  }, { quoted: m });
}

// ─── Download dari Mega.nz ────────────────────────────────────────────────────
async function handleMega(alya, m, megaUrl) {
  if (!megaUrl.includes('#')) {
    await alya.sendMessage(m.chat, {
      text:
        `❌ *Mega.nz URL tidak lengkap!*\n\n` +
        `URL harus menyertakan *decryption key* (bagian setelah #).\n\n` +
        `✅ *Format benar:*\n` +
        `\`https://mega.nz/file/XXXXXXXX#YYYYYY\`\n\n` +
        `💡 Copy URL lengkap dari browser termasuk bagian setelah tanda *#*`,
    }, { quoted: m });
    return false;
  }

  const { File } = require('megajs');
  const chunks   = [];

  return new Promise((resolve, reject) => {
    let file;
    try { file = File.fromURL(megaUrl); }
    catch (e) { return reject(new Error('URL Mega.nz tidak valid: ' + e.message)); }

    file.loadAttributes((err, f) => {
      if (err) return reject(new Error('Gagal baca metadata Mega.nz: ' + (err.message || err)));

      const fileName = f.name || `anime_${Date.now()}.mp4`;
      const sizeMB   = f.size ? (f.size / 1024 / 1024).toFixed(1) : '?';

      // Notif progres
      alya.sendMessage(m.chat, {
        text:
          `📥 *Download dari Mega.nz...*\n\n` +
          `📄 *File:* ${fileName}\n` +
          `📦 *Ukuran:* ${sizeMB} MB\n\n` +
          `_Mohon tunggu, file sedang diunduh..._`,
      }, { quoted: m }).catch(() => {});

      const stream = f.download();
      stream.on('data',  chunk => chunks.push(chunk));
      stream.on('error', err => reject(new Error('Stream error: ' + err.message)));
      stream.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks);
          await sendAsDocument(alya, m, buffer, fileName, sizeMB, 'Mega.nz');
          resolve(true);
        } catch (sendErr) {
          reject(sendErr);
        }
      });
    });
  });
}

// ─── Download dari Pixeldrain ──────────────────────────────────────────────────
async function handlePixeldrain(alya, m, pdUrl) {
  const pdMatch = pdUrl.match(/pixeldrain\.com\/u\/([a-zA-Z0-9]+)/);
  if (!pdMatch) throw new Error('Pixeldrain file ID tidak ditemukan');

  const pdId   = pdMatch[1];
  const apiUrl = `https://pixeldrain.com/api/file/${pdId}`;
  const infoUrl= `https://pixeldrain.com/api/file/${pdId}/info`;

  // Ambil info dulu
  let fileName = `pixeldrain_${pdId}.mp4`;
  let sizeMB   = '?';
  try {
    const info = await axios.get(infoUrl, { timeout: 10000 });
    fileName   = info.data?.name || fileName;
    if (info.data?.size) sizeMB = (info.data.size / 1024 / 1024).toFixed(1);
  } catch {}

  alya.sendMessage(m.chat, {
    text: `📥 *Download dari Pixeldrain...*\n📄 *File:* ${fileName}\n📦 *Ukuran:* ${sizeMB} MB\n\n_Sedang mengunduh..._`,
  }, { quoted: m }).catch(() => {});

  const resp = await axios.get(apiUrl, {
    responseType: 'arraybuffer',
    timeout: 180000,
    headers: { 'User-Agent': 'Mozilla/5.0' },
    maxContentLength: 300 * 1024 * 1024,
  });

  await sendAsDocument(alya, m, Buffer.from(resp.data), fileName, sizeMB, 'Pixeldrain');
  return true;
}

// ─── Download direct MP4/MKV/dll ──────────────────────────────────────────────
async function handleDirect(alya, m, url) {
  const urlObj   = new URL(url);
  const rawName  = path.basename(urlObj.pathname) || `anime_${Date.now()}.mp4`;
  const fileName = decodeURIComponent(rawName);

  // HEAD untuk ukuran & mime
  let sizeMB = '?';
  try {
    const head = await axios.head(url, { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    const cl   = head.headers?.['content-length'];
    if (cl) sizeMB = (parseInt(cl) / 1024 / 1024).toFixed(1);
    if (sizeMB !== '?' && parseFloat(sizeMB) > 250) {
      throw new Error(`File terlalu besar (${sizeMB} MB). WhatsApp max ~200MB.`);
    }
  } catch (e) {
    if (e.message.includes('terlalu besar')) throw e;
  }

  alya.sendMessage(m.chat, {
    text: `📥 *Mengunduh file...*\n📄 *File:* ${fileName}\n📦 *Ukuran:* ${sizeMB} MB\n\n_Sedang download..._`,
  }, { quoted: m }).catch(() => {});

  const resp = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 180000,
    headers: { 'User-Agent': 'Mozilla/5.0' },
    maxContentLength: 250 * 1024 * 1024,
  });

  await sendAsDocument(alya, m, Buffer.from(resp.data), fileName, sizeMB, 'Direct Download');
  return true;
}

// ─── Main Plugin ───────────────────────────────────────────────────────────────
module.exports = {
  command: ['animedl', 'adl'],
  tags: ['anime'],

  run: async (alya, m, ctx) => {
    const { args, text, prefix, command, replyalya } = ctx;

    const inputUrl = (args.join(' ') || text || '').trim();

    if (!inputUrl) {
      return replyalya(
        `╭─「 📥 *ANIME DL* 」\n│\n` +
        `│ Download & kirim file anime langsung\n│ ke chat sebagai dokumen.\n│\n` +
        `│ *Cara pakai:*\n│ ${prefix}${command} <link>\n│\n` +
        `│ *Support:*\n` +
        `│ • 🟣 mega.nz — download & kirim file\n` +
        `│ • 🟠 desustream.com — resolve → download\n` +
        `│ • 🟡 pixeldrain.com — download & kirim\n` +
        `│ • 🌐 Direct MP4/MKV — download & kirim\n` +
        `│ • 🔵 GDrive, Mediafire — info link\n` +
        `╰──────────────────`
      );
    }

    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
      let finalUrl = inputUrl.trim();

      // ── STEP 1: Resolve safelink / Desustream ──────────────────────────────
      const isDesuOrSafe =
        finalUrl.includes('desustream') ||
        finalUrl.includes('safelink')   ||
        finalUrl.includes('ouo.io')     ||
        finalUrl.includes('tinyurl.com/') && !finalUrl.match(/\.(mp4|mkv|webm)/i);

      if (isDesuOrSafe) {
        await alya.sendMessage(m.chat, {
          text: '🔗 *Me-resolve safelink...*\n_Mohon tunggu sebentar_',
        }, { quoted: m });

        const resolved = await resolveDesustream(finalUrl);

        if (!resolved) {
          await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
          return replyalya(
            `❌ *Gagal resolve safelink/Desustream*\n\n` +
            `Kemungkinan:\n` +
            `• Safelink sudah kadaluarsa\n` +
            `• Halaman butuh verifikasi Captcha manual\n` +
            `• Server sedang down\n\n` +
            `💡 *Solusi:*\n` +
            `Buka link di browser → copy URL Mega.nz / file langsung\n` +
            `lalu kirim ulang ke bot.`
          );
        }

        finalUrl = resolved;
      }

      finalUrl = finalUrl.trim();

      // ── STEP 2: Proses berdasarkan jenis URL ────────────────────────────────

      // 🟣 Mega.nz
      if (finalUrl.includes('mega.nz')) {
        await handleMega(alya, m, finalUrl);
        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        return;
      }

      // 🟡 Pixeldrain
      if (finalUrl.includes('pixeldrain.com')) {
        await handlePixeldrain(alya, m, finalUrl);
        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        return;
      }

      // 🔵 Google Drive — tidak bisa download langsung, kasih info
      if (finalUrl.includes('drive.google.com')) {
        const m1     = finalUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
        const m2     = finalUrl.match(/id=([a-zA-Z0-9_-]+)/);
        const fileId = (m1 && m1[1]) || (m2 && m2[1]) || null;
        const directUrl = fileId
          ? `https://drive.google.com/uc?export=download&id=${fileId}`
          : finalUrl;

        await alya.sendMessage(m.chat, {
          text:
            `⚠️ *Google Drive Detected*\n\n` +
            (fileId ? `🆔 *File ID:* \`${fileId}\`\n🔗 *Direct:* ${directUrl}\n\n` : '') +
            `_File GDrive besar tidak bisa diunduh otomatis oleh bot karena quota/cookie Google._\n` +
            `Silakan download manual dari link di atas, lalu upload ke Mega.nz dan kirim ulang.`,
        }, { quoted: m });
        await alya.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
        return;
      }

      // 🔴 Mediafire — tidak bisa download langsung
      if (finalUrl.includes('mediafire.com')) {
        await alya.sendMessage(m.chat, {
          text:
            `⚠️ *Mediafire Detected*\n\n` +
            `🔗 ${finalUrl}\n\n` +
            `_Mediafire memerlukan verifikasi di browser untuk download._\n` +
            `Buka link manual → copy direct download URL → kirim ke bot.`,
        }, { quoted: m });
        await alya.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
        return;
      }

      // 🌐 Direct file (MP4/MKV/dll) atau URL lain yang bisa di-download
      if (/\.(mp4|mkv|webm|m4v|avi|zip|rar|7z)(\?.*)?$/i.test(finalUrl)) {
        await handleDirect(alya, m, finalUrl);
        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        return;
      }

      // ── Fallback: coba download biasa ──────────────────────────────────────
      try {
        await handleDirect(alya, m, finalUrl);
        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } catch (fallbackErr) {
        await alya.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
        await alya.sendMessage(m.chat, {
          text:
            `⚠️ *Format URL tidak dikenali / gagal download*\n\n` +
            `URL: \`${finalUrl}\`\n\n` +
            `✅ *Format yang didukung:*\n` +
            `• 🟣 \`mega.nz/file/ID#KEY\` — harus ada #key!\n` +
            `• 🟠 \`desustream.com/...\` — resolve otomatis\n` +
            `• 🟡 \`pixeldrain.com/u/ID\`\n` +
            `• 🌐 Direct link \`.mp4\` / \`.mkv\`\n\n` +
            `_Error: ${fallbackErr.message}_`,
        }, { quoted: m });
      }

    } catch (e) {
      console.error('[animedl] ERROR:', e.message || e);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {});
      replyalya(
        `❌ *Gagal download*\n\n_${e.message || 'Error tidak diketahui'}_\n\n` +
        `Coba lagi atau hubungi owner jika error terus.`
      );
    }
  },
};
