// Plugin: tourl / uploadurl
// Alya V13 — Upload media ke banyak CDN sekaligus
// Servers: Litterbox, Pone, Kappa, Uguu, TmpFiles, Upload.ee, Top4top, Leopard, Qu.ax, Termai
// Commands: tourl, uploadurl, ul

'use strict';

const FormData = require('form-data');
const axios    = require('axios');

// ─── Format size ───────────────────────────────────────────────────────────────
function fmtSize(bytes) {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

// ─── Get mime via file-type ────────────────────────────────────────────────────
async function getFileInfo(buffer) {
  try {
    const ft = require('file-type');
    const result = Buffer.isBuffer(buffer) && buffer.length > 0
      ? (typeof ft.fromBuffer === 'function' ? await ft.fromBuffer(buffer) : null)
      : null;
    return result || { ext: 'bin', mime: 'application/octet-stream' };
  } catch {
    return { ext: 'bin', mime: 'application/octet-stream' };
  }
}

// ─── Upload Providers ──────────────────────────────────────────────────────────

// 1. Litterbox (catbox sementara) — 72 jam
async function uploadLitterbox(buffer, filename) {
  try {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('time', '72h');
    form.append('fileToUpload', buffer, { filename });
    const res = await axios.post('https://litterbox.catbox.moe/resources/internals/api.php', form, {
      headers: form.getHeaders(), timeout: 60000, maxBodyLength: Infinity,
    });
    const url = typeof res.data === 'string' ? res.data.trim() : null;
    return url?.startsWith('https://') ? url : null;
  } catch (e) { console.error('[tourl:litterbox]', e.message); return null; }
}

// 2. Pone — Permanen
async function uploadPone(buffer, filename) {
  try {
    const form = new FormData();
    form.append('file', buffer, { filename });
    const res = await axios.post('https://u.pone.rs/upload', form, {
      headers: { ...form.getHeaders(), 'User-Agent': 'Mozilla/5.0' },
      timeout: 60000, maxBodyLength: Infinity,
    });
    // Pone returns JSON { url: "..." } or plain text URL
    const data = res.data;
    if (typeof data === 'string' && data.trim().startsWith('https://')) return data.trim();
    if (data?.url) return data.url;
    if (data?.file?.url) return data.file.url;
    return null;
  } catch (e) { console.error('[tourl:pone]', e.message); return null; }
}

// 3. Kappa.lol — Permanen
async function uploadKappa(buffer, filename) {
  try {
    const form = new FormData();
    form.append('file', buffer, { filename });
    const res = await axios.post('https://kappa.lol/api/upload', form, {
      headers: { ...form.getHeaders(), 'User-Agent': 'Mozilla/5.0' },
      timeout: 60000, maxBodyLength: Infinity,
    });
    const data = res.data;
    if (typeof data === 'string') {
      const match = data.match(/https?:\/\/kappa\.lol\/\S+/);
      return match ? match[0] : null;
    }
    return data?.url || data?.link || null;
  } catch (e) { console.error('[tourl:kappa]', e.message); return null; }
}

// 4. Uguu.se — 48 jam
async function uploadUguu(buffer, filename) {
  try {
    const form = new FormData();
    form.append('files[]', buffer, { filename });
    form.append('randomname', 'true');
    const res = await axios.post('https://uguu.se/upload', form, {
      headers: { ...form.getHeaders(), 'User-Agent': 'Mozilla/5.0' },
      timeout: 60000, maxBodyLength: Infinity,
    });
    return res.data?.files?.[0]?.url || null;
  } catch (e) { console.error('[tourl:uguu]', e.message); return null; }
}

// 5. TmpFiles.org — 6 jam
async function uploadTmpFiles(buffer, filename) {
  try {
    const form = new FormData();
    form.append('file', buffer, { filename, contentType: 'application/octet-stream' });
    const res = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
      headers: form.getHeaders(), timeout: 60000, maxBodyLength: Infinity,
    });
    const rawUrl = res?.data?.data?.url;
    if (!rawUrl) return null;
    return rawUrl.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
  } catch (e) { console.error('[tourl:tmpfiles]', e.message); return null; }
}

// 6. Upload.ee — Permanen
async function uploadUploadEe(buffer, filename) {
  try {
    const form = new FormData();
    form.append('file', buffer, { filename });
    const res = await axios.post('https://www.upload.ee/api/', form, {
      headers: { ...form.getHeaders(), 'User-Agent': 'Mozilla/5.0' },
      timeout: 60000, maxBodyLength: Infinity,
    });
    const data = res.data;
    if (typeof data === 'string') {
      const match = data.match(/https?:\/\/www\.upload\.ee\/\S+/);
      return match ? match[0] : null;
    }
    return data?.full_url || data?.url || null;
  } catch (e) { console.error('[tourl:uploadee]', e.message); return null; }
}

// 7. Top4top — Permanen
async function uploadTop4top(buffer, filename, mime) {
  try {
    const form = new FormData();
    form.append('file', buffer, { filename, contentType: mime || 'application/octet-stream' });
    const res = await axios.post('https://www.top4top.io/upload', form, {
      headers: { ...form.getHeaders(), 'User-Agent': 'Mozilla/5.0' },
      timeout: 60000, maxBodyLength: Infinity,
    });
    const data = res.data;
    if (typeof data === 'string') {
      const match = data.match(/https?:\/\/[a-z]\.top4top\.io\/\S+/);
      return match ? match[0] : null;
    }
    return data?.url || data?.link || null;
  } catch (e) { console.error('[tourl:top4top]', e.message); return null; }
}

// 8. Leopard (pecon.us) — Permanen
async function uploadLeopard(buffer, filename) {
  try {
    const form = new FormData();
    form.append('file', buffer, { filename });
    const res = await axios.post('https://leopard.hosting.pecon.us/upload', form, {
      headers: { ...form.getHeaders(), 'User-Agent': 'Mozilla/5.0' },
      timeout: 60000, maxBodyLength: Infinity,
    });
    const data = res.data;
    if (typeof data === 'string') {
      const match = data.match(/https?:\/\/leopard\.\S+/);
      return match ? match[0] : null;
    }
    return data?.url || data?.link || null;
  } catch (e) { console.error('[tourl:leopard]', e.message); return null; }
}

// 9. Qu.ax — Permanen
async function uploadQuax(buffer, filename, mime) {
  try {
    const form = new FormData();
    form.append('files[]', buffer, { filename, contentType: mime || 'application/octet-stream' });
    const res = await axios.post('https://qu.ax/upload.php', form, {
      headers: form.getHeaders(), timeout: 60000, maxBodyLength: Infinity,
    });
    if (res.data?.success && res.data.files?.[0]?.url) return res.data.files[0].url;
    return null;
  } catch (e) { console.error('[tourl:quax]', e.message); return null; }
}

// 10. Termai — Expiry unknown
async function uploadTermai(buffer, filename) {
  try {
    const form = new FormData();
    form.append('file', buffer, { filename });
    const res = await axios.post('https://c.termai.cc/upload', form, {
      headers: { ...form.getHeaders(), 'User-Agent': 'Mozilla/5.0' },
      timeout: 60000, maxBodyLength: Infinity,
    });
    const data = res.data;
    if (typeof data === 'string') {
      const match = data.match(/https?:\/\/c\.termai\.cc\/\S+/);
      return match ? match[0] : null;
    }
    return data?.url || data?.link || null;
  } catch (e) { console.error('[tourl:termai]', e.message); return null; }
}

// ─── Server config list ────────────────────────────────────────────────────────
// { label, expiry, fn }
function buildServers(buffer, filename, mime) {
  return [
    { label: 'Litterbox',  expiry: '72 jam',    fn: () => uploadLitterbox(buffer, filename) },
    { label: 'Pone',       expiry: '∞ Permanen', fn: () => uploadPone(buffer, filename) },
    { label: 'Kappa',      expiry: '∞ Permanen', fn: () => uploadKappa(buffer, filename) },
    { label: 'Uguu',       expiry: '48 jam',     fn: () => uploadUguu(buffer, filename) },
    { label: 'TmpFiles',   expiry: '6 jam',      fn: () => uploadTmpFiles(buffer, filename) },
    { label: 'Upload.ee',  expiry: '∞ Permanen', fn: () => uploadUploadEe(buffer, filename) },
    { label: 'Top4top',    expiry: '∞ Permanen', fn: () => uploadTop4top(buffer, filename, mime) },
    { label: 'Leopard',    expiry: '∞ Permanen', fn: () => uploadLeopard(buffer, filename) },
    { label: 'Qu.ax',      expiry: '∞ Permanen', fn: () => uploadQuax(buffer, filename, mime) },
    { label: 'Termai',     expiry: 'Unknown',    fn: () => uploadTermai(buffer, filename) },
  ];
}

// ─── Main Plugin ───────────────────────────────────────────────────────────────
module.exports = {
  command: ['tourl', 'uploadurl', 'ul'],
  tags: ['tools'],
  run: async (alya, m, ctx) => {
    const { prefix, command, quoted, mime, replyalya } = ctx;

    if (!quoted) {
      return replyalya(
        `🌐 *TO URL / UPLOAD*\n\n` +
        `Reply *gambar/video/audio/file* dengan *${prefix}${command}*\n\n` +
        `Bot akan upload ke banyak CDN sekaligus:\n` +
        `• *Litterbox* — 72 jam\n` +
        `• *Pone, Kappa, Upload.ee, Top4top, Leopard, Qu.ax* — Permanen\n` +
        `• *Uguu* — 48 jam\n` +
        `• *TmpFiles* — 6 jam\n` +
        `• *Termai* — Unknown`
      );
    }

    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
    replyalya('📤 *Mengupload ke semua server...*\nBentar ya, ini proses ke 10 CDN sekaligus 🌐');

    try {
      const buffer = await quoted.download();
      if (!buffer || !buffer.length) throw new Error('Buffer media kosong');

      const fileInfo = await getFileInfo(buffer);
      const ext      = fileInfo.ext || 'bin';
      const mimeType = fileInfo.mime || mime || 'application/octet-stream';
      const filename = `alya_${Date.now()}.${ext}`;

      // Upload semua server paralel
      const servers  = buildServers(buffer, filename, mimeType);
      const results  = await Promise.allSettled(servers.map(s => s.fn()));

      const successes = [];
      const failures  = [];

      for (let i = 0; i < servers.length; i++) {
        const { label, expiry } = servers[i];
        const r = results[i];
        const url = r.status === 'fulfilled' ? r.value : null;
        if (url) {
          successes.push({ label, expiry, url });
        } else {
          failures.push(label);
        }
      }

      if (!successes.length) {
        await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return replyalya('❌ *Semua server gagal!*\nCoba lagi beberapa saat nanti.');
      }

      // ── Build caption ──────────────────────────────────────
      let caption =
        `🚀 *UPLOAD BERHASIL!* 🚀\n\n` +
        `Yeay! Media kamu udah berhasil di-upload ke server awan. ` +
        `Pilih linknya ya kak! ✨\n\n`;

      for (const s of successes) {
        caption +=
          `☁️ *Server :* ${s.label}\n` +
          `⏳ *Expired :* ${s.expiry}\n` +
          `🔗 *Link :*\n${s.url}\n\n`;
      }

      if (failures.length) {
        caption += `⚠️ _Fyi kak, ada yang gagal di server: ${failures.join(', ')}_`;
      }

      // ── Coba interactive message dengan tombol copy ────────
      let sent = false;
      try {
        const { proto, generateWAMessageFromContent } = require('@whiskeysockets/baileys');

        const buttons = successes.map(s => ({
          name: 'cta_copy',
          buttonParamsJson: JSON.stringify({
            display_text: `📋 Copy ${s.label} (${s.expiry})`,
            copy_code: s.url,
          }),
        })).slice(0, 5); // WhatsApp max 5 tombol per interactive

        const msg = generateWAMessageFromContent(m.chat, {
          viewOnceMessage: {
            message: {
              messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
              interactiveMessage: proto.Message.InteractiveMessage.create({
                header: proto.Message.InteractiveMessage.Header.create({
                  hasMediaAttachment: false,
                }),
                body: proto.Message.InteractiveMessage.Body.create({ text: caption }),
                footer: proto.Message.InteractiveMessage.Footer.create({
                  text: '🌐 Alya — Multi CDN Uploader',
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                  buttons,
                }),
              }),
            },
          },
        }, { quoted: m });

        await alya.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        sent = true;
      } catch (e) {
        console.warn('[tourl] interactive gagal, fallback teks:', e.message);
      }

      if (!sent) {
        await alya.sendMessage(m.chat, { text: caption }, { quoted: m });
      }

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
      console.error('[tourl]', err.message);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {});
      replyalya(`❌ *Gagal upload!*\n\n_${err.message}_`);
    }
  },
};
