// Plugin: bratvideo (FIXED V20)
// Ported dari Ourin bratvid2.js approach (API sederhana + fallback per-kata)
// Commands: bratvid, bratvideo, bratv, bratvideogenerator, bratvidhd

'use strict';

const fs   = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// ── Resolve ffmpeg ──────────────────────────────────────────────────────────
function getFfmpeg() {
  if (global.FFMPEG_PATH && fs.existsSync(global.FFMPEG_PATH)) return global.FFMPEG_PATH;
  try { const p = require('ffmpeg-static'); if (p && fs.existsSync(p)) return p; } catch {}
  try { const p = require('@ffmpeg-installer/ffmpeg').path; if (p && fs.existsSync(p)) return p; } catch {}
  try { execSync('ffmpeg -version', { stdio: 'pipe' }); return 'ffmpeg'; } catch {}
  return null;
}

function getTmpDir() {
  const d = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  return d;
}

// ── Download buffer helper ─────────────────────────────────────────────────
async function getBuffer(url) {
  const axios = require('axios');
  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 30000,
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  return Buffer.from(res.data);
}

// ── Approach 1 (Ourin bratvid2): single API call ───────────────────────────
// api-faa.my.id returns MP4 buffer directly
async function bratSingleAPI(text) {
  const APIS = [
    `https://api-faa.my.id/faa/bratvid?text=${encodeURIComponent(text)}`,
    `https://brat.siputzx.my.id/mp4?text=${encodeURIComponent(text)}`,
    `https://brat.termai.cc/animate?text=${encodeURIComponent(text)}&hd=false&emojiType=ios`,
  ];
  for (const url of APIS) {
    try {
      const buf = await getBuffer(url);
      if (buf && buf.length > 1000) return buf;
    } catch {}
  }
  return null;
}

// ── Approach 2 (Bell per-kata): download per kata → ffmpeg concat ──────────
async function bratPerKata(teks, sender, ffmpeg) {
  const tmpDir  = getTmpDir();
  const ts      = Date.now();
  const frames  = [];

  for (let i = 0; i < teks.length; i++) {
    const currentText = teks.slice(0, i + 1).join(' ');
    let buf = null;
    const APIS = [
      `https://brat.siputzx.my.id/mp4?text=${encodeURIComponent(currentText)}`,
      `https://api-faa.my.id/faa/bratvid?text=${encodeURIComponent(currentText)}`,
      `https://brat.termai.cc/animate?text=${encodeURIComponent(currentText)}&hd=false`,
    ];
    for (const url of APIS) {
      try { buf = await getBuffer(url); if (buf?.length > 200) break; } catch {}
    }
    if (!buf?.length) throw new Error(`Frame ke-${i+1} gagal dari semua API`);
    const framePath = path.join(tmpDir, `${sender}_brat_${ts}_${i}.mp4`);
    fs.writeFileSync(framePath, buf);
    frames.push(framePath);
  }

  // Build ffmpeg concat list
  const listPath  = path.join(tmpDir, `${sender}_brat_${ts}.txt`);
  const outMp4    = path.join(tmpDir, `${sender}_brat_${ts}_out.mp4`);
  const outWebp   = path.join(tmpDir, `${sender}_brat_${ts}.webp`);

  let listContent = '';
  for (let i = 0; i < frames.length; i++) {
    listContent += `file '${frames[i]}'\nduration ${i === frames.length - 1 ? 3 : 0.5}\n`;
  }
  listContent += `file '${frames[frames.length - 1]}'\nduration 3\n`;
  fs.writeFileSync(listPath, listContent);

  await execAsync(
    `"${ffmpeg}" -y -f concat -safe 0 -i "${listPath}" ` +
    `-vf "scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=15" ` +
    `-c:v libx264 -preset veryfast -pix_fmt yuv420p "${outMp4}"`,
    { timeout: 120000 }
  );

  // Convert mp4 → webp animated sticker
  await execAsync(
    `"${ffmpeg}" -y -i "${outMp4}" ` +
    `-vcodec libwebp -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=12,pad=512:512:-1:-1:color=0x00000000" ` +
    `-loop 0 -ss 00:00:00 -t 10 -an -vsync 0 "${outWebp}"`,
    { timeout: 120000 }
  );

  const result = { webpPath: outWebp, mp4Path: outMp4, frames, listPath };
  return result;
}

// ── Add EXIF to WebP sticker ───────────────────────────────────────────────
async function addExif(webpBuf, packname, author) {
  try {
    const { writeExifVid } = require('../../lib/exif');
    const result = await writeExifVid(webpBuf, { packname, author });
    if (typeof result === 'string' && fs.existsSync(result)) {
      const buf = fs.readFileSync(result);
      fs.unlinkSync(result);
      return buf;
    }
    return webpBuf;
  } catch {
    return webpBuf;
  }
}

module.exports = {
  command: ['bratvid', 'bratvideo', 'bratv', 'bratvideogenerator', 'bratvidhd'],
  tags: ['maker'],
  run: async (alya, m, ctx) => {
    const { command, q, text, prefix, sender, pushname, replyalya, user } = ctx;

    const rawInput  = (q || text || m.quoted?.text || '').trim();
    const inputText = rawInput.split('--')[0].trim();

    // ── Usage message ──────────────────────────────────────────────────────
    if (!inputText) {
      return replyalya(
        `🎬 *ʙʀᴀᴛ ᴀɴɪᴍᴀᴛᴇᴅ sᴛɪᴄᴋᴇʀ*\n\n` +
        `> Buat stiker animasi brat style\n\n` +
        `*Cara Pakai:*\n` +
        `\`Contoh: ${prefix}${command} Halo semua\`\n` +
        `\`Contoh: ${prefix}${command} Hi gaes\`\n\n` +
        `*Alias:* \`bratvid\` \`bratvideo\` \`bratv\`\n` +
        `*Biaya:* 5 limit`
      );
    }

    const userData = user || global.db?.users?.[sender];
    const biaya = 5;
    if (userData && (userData.limit ?? 99) < biaya) {
      return replyalya(`❌ Limit tidak cukup! Butuh *${biaya}* limit.\nKamu punya: *${userData.limit ?? 0}*`);
    }

    const ffmpeg = getFfmpeg();

    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
    replyalya('⏳ *Membuat brat sticker animated...*\nSabar sebentar ya 🎬');

    const tmpDir = getTmpDir();
    const ts     = Date.now();
    const teks   = inputText.split(' ').filter(Boolean);

    let stickerBuf = null;
    let tempFiles  = [];

    try {
      // ── Approach 1: Single API (Ourin bratvid2 style) ──────────────────
      // Ini lebih reliable karena 1 request = 1 stiker animasi
      let mp4Buf = null;
      try {
        mp4Buf = await bratSingleAPI(inputText);
      } catch {}

      if (mp4Buf && mp4Buf.length > 1000) {
        // mp4 → webp animated sticker via ffmpeg
        if (ffmpeg) {
          const tmpMp4  = path.join(tmpDir, `brat_single_${ts}.mp4`);
          const tmpWebp = path.join(tmpDir, `brat_single_${ts}.webp`);
          tempFiles.push(tmpMp4, tmpWebp);
          fs.writeFileSync(tmpMp4, mp4Buf);

          try {
            await execAsync(
              `"${ffmpeg}" -y -i "${tmpMp4}" ` +
              `-vcodec libwebp -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=12,pad=512:512:-1:-1:color=0x00000000" ` +
              `-loop 0 -ss 00:00:00 -t 10 -an -vsync 0 "${tmpWebp}"`,
              { timeout: 60000 }
            );
            if (fs.existsSync(tmpWebp) && fs.statSync(tmpWebp).size > 100) {
              const rawBuf = fs.readFileSync(tmpWebp);
              stickerBuf   = await addExif(rawBuf,
                global.packname || 'Alya Bot',
                pushname || global.author || 'Alya'
              );
            }
          } catch (e) {
            console.warn('[bratvid] webp convert gagal:', e.message);
          }
        }
      }

      // ── Approach 2: Per-kata (Bell style) jika approach 1 gagal ────────
      if (!stickerBuf && ffmpeg && teks.length > 0) {
        const result = await bratPerKata(teks, sender, ffmpeg);
        tempFiles.push(result.webpPath, result.mp4Path, result.listPath, ...result.frames);

        if (fs.existsSync(result.webpPath) && fs.statSync(result.webpPath).size > 100) {
          const rawBuf = fs.readFileSync(result.webpPath);
          stickerBuf   = await addExif(rawBuf,
            global.packname || 'Alya Bot',
            pushname || global.author || 'Alya'
          );
        }
      }

      if (!stickerBuf) throw new Error('Gagal membuat stiker dari semua metode');

      if (userData) userData.limit = (userData.limit ?? 99) - biaya;

      await alya.sendMessage(m.chat, { sticker: stickerBuf }, { quoted: m });
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      replyalya(
        `✅ *Brat sticker selesai!*\n` +
        `━━━━━━━━━━━━━━\n` +
        `🎬 Teks  : ${inputText}\n` +
        `💸 Limit : -${biaya} | Sisa: ${userData?.limit ?? '-'}`
      );

    } catch (e) {
      console.error('[bratvid]', e.message || e);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {});
      replyalya(
        `❌ *Gagal buat brat sticker!*\n\n` +
        `_${e.message || 'Server error'}_\n\n` +
        `Coba lagi nanti ya 😤`
      );
    } finally {
      for (const f of tempFiles) {
        try { if (f && fs.existsSync(f)) fs.unlinkSync(f); } catch {}
      }
    }
  }
};
