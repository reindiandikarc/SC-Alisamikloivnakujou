// Plugin: tomp4 (FIXED V20)
// Ported dari Ourin tovideo.js approach:
//   WebP animated → sharp gif → fluent-ffmpeg mp4
//   Fallback: execSync ffmpeg langsung
// Commands: tomp4, tovideo, togif, stktomp4, stickertomp4, tovid

'use strict';

const fs   = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// ── Resolve ffmpeg binary ──────────────────────────────────────────────────
function getFfmpeg() {
  if (global.FFMPEG_PATH && fs.existsSync(global.FFMPEG_PATH)) return global.FFMPEG_PATH;
  try { const p = require('ffmpeg-static'); if (p && fs.existsSync(p)) return p; } catch {}
  try { const p = require('@ffmpeg-installer/ffmpeg').path; if (p && fs.existsSync(p)) return p; } catch {}
  try { execSync('ffmpeg -version', { stdio: 'pipe' }); return 'ffmpeg'; } catch {}
  return null;
}

// ── Tmp dir helper ─────────────────────────────────────────────────────────
function getTmpDir() {
  const d = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  return d;
}

// ── Cek apakah WebP animated (ada marker ANIM/ANMF) ───────────────────────
function isAnimatedWebp(buf) {
  if (!buf || buf.length < 50) return false;
  return buf.includes(Buffer.from('ANIM')) || buf.includes(Buffer.from('ANMF'));
}

// ── WebP animated → GIF via sharp ─────────────────────────────────────────
async function webpToGif(buf) {
  try {
    const sharp = require('sharp');
    const meta  = await sharp(buf).metadata();
    if (!meta.pages || meta.pages <= 1) return null;
    return await sharp(buf, { animated: true, pages: -1 }).gif({ loop: 0 }).toBuffer();
  } catch (e) {
    console.warn('[tomp4] sharp webpToGif gagal:', e.message);
    return null;
  }
}

// ── GIF/MP4/WebP → MP4 via ffmpeg ─────────────────────────────────────────
function convertToMp4(inputPath, outputPath, ffmpeg) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('FFmpeg timeout 60s'));
    }, 60000);

    const cmd = `"${ffmpeg}" -y -i "${inputPath}" ` +
      `-movflags faststart -pix_fmt yuv420p ` +
      `-vf "scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=15" ` +
      `-c:v libx264 -preset ultrafast -crf 23 -an "${outputPath}"`;

    exec(cmd, { timeout: 60000 }, (err) => {
      clearTimeout(timeout);
      if (err) return reject(new Error('FFmpeg: ' + err.message));
      if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size < 100) {
        return reject(new Error('Output file kosong'));
      }
      resolve();
    });
  });
}

// ── Fallback: WebP → MP4 tanpa intermediate GIF ───────────────────────────
function webpDirectToMp4(inputPath, outputPath, ffmpeg) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('FFmpeg timeout')), 60000);
    const cmd = `"${ffmpeg}" -y -i "${inputPath}" ` +
      `-vf "scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=15" ` +
      `-c:v libx264 -preset ultrafast -pix_fmt yuv420p -movflags +faststart -an "${outputPath}"`;
    exec(cmd, { timeout: 60000 }, (err) => {
      clearTimeout(timeout);
      if (err) return reject(err);
      if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size < 100) {
        return reject(new Error('Output kosong'));
      }
      resolve();
    });
  });
}

module.exports = {
  command: ['tomp4', 'tovideo', 'togif', 'stktomp4', 'stickertomp4', 'tovid'],
  tags: ['converter'],
  run: async (alya, m, ctx) => {
    const { command, prefix, quoted, mime, replyalya } = ctx;

    // ── Usage message ──────────────────────────────────────────────────────
    if (!m.quoted) {
      return replyalya(
        `🎬 *ᴛᴏ ᴍᴘ4 / ᴄᴏɴᴠᴇʀᴛᴇʀ*\n\n` +
        `> Konversi stiker animasi atau video ke MP4\n\n` +
        `*Cara Pakai:*\n` +
        `> 1. Reply stiker animasi + ketik \`${prefix}${command}\`\n` +
        `> 2. Reply video + ketik \`${prefix}${command}\`\n\n` +
        `*Alias:* \`tomp4\` \`tovid\` \`tovideo\` \`togif\` \`stktomp4\`\n\n` +
        `\`Contoh: .tomp4\` (reply stiker)\n` +
        `\`Contoh: .togif\` (reply stiker → gif loop)`
      );
    }

    // ── Deteksi tipe media ─────────────────────────────────────────────────
    const qMime     = quoted?.message?.stickerMessage ? 'image/webp' : (quoted.mimetype || mime || '');
    const isSticker = /webp/i.test(qMime) || !!quoted?.message?.stickerMessage;
    const isVideo   = /video/i.test(qMime);

    if (!isSticker && !isVideo) {
      return replyalya(
        `❌ *Format Tidak Didukung!*\n\n` +
        `Harus reply:\n` +
        `• *Stiker animasi* (WebP)\n` +
        `• *Video* (MP4/MKV/WebM)\n\n` +
        `_Terdeteksi: ${qMime || 'unknown'}_`
      );
    }

    // ── Stiker harus animasi ───────────────────────────────────────────────
    if (isSticker) {
      const stickerMsg = quoted?.message?.stickerMessage;
      if (stickerMsg && stickerMsg.isAnimated === false) {
        return replyalya(
          `❌ *Stiker Tidak Animasi!*\n\n` +
          `Gunakan stiker yang *bergerak* ya.\n` +
          `Stiker statis tidak bisa diconvert ke video.`
        );
      }
    }

    const ffmpeg = getFfmpeg();
    if (!ffmpeg) {
      return replyalya(
        `❌ *FFmpeg tidak ditemukan!*\n\n` +
        `Install dulu:\n` +
        `• VPS: \`sudo apt install ffmpeg\`\n` +
        `• Termux: \`pkg install ffmpeg\``
      );
    }

    await alya.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });
    replyalya('⏳ *Sedang mengkonversi ke MP4...*\nSabar sebentar ya 🎬');

    const ts      = Date.now();
    const tmpDir  = getTmpDir();
    const tmpIn   = path.join(tmpDir, `tomp4_in_${ts}${isSticker ? '.webp' : '.mp4'}`);
    const tmpGif  = path.join(tmpDir, `tomp4_gif_${ts}.gif`);
    const tmpOut  = path.join(tmpDir, `tomp4_out_${ts}.mp4`);

    try {
      // ── Download buffer ──────────────────────────────────────────────────
      let buffer;
      try { buffer = await quoted.download(); } catch {}
      if (!buffer?.length) {
        try { buffer = await alya.downloadMediaMessage(quoted); } catch {}
      }
      if (!buffer?.length) throw new Error('Gagal download media — coba lagi');
      fs.writeFileSync(tmpIn, buffer);

      let mp4Buf;

      if (isSticker) {
        // ── Ourin approach: WebP → GIF → MP4 ────────────────────────────
        let done = false;

        // Method 1: sharp animated WebP → GIF → ffmpeg MP4
        try {
          const gifBuf = await webpToGif(buffer);
          if (gifBuf && gifBuf.length > 100) {
            fs.writeFileSync(tmpGif, gifBuf);
            await convertToMp4(tmpGif, tmpOut, ffmpeg);
            done = true;
          }
        } catch (e) {
          console.warn('[tomp4] m1 (sharp+gif):', e.message);
        }

        // Method 2: WebP langsung ke ffmpeg (no intermediate GIF)
        if (!done) {
          try {
            await webpDirectToMp4(tmpIn, tmpOut, ffmpeg);
            done = true;
          } catch (e) {
            console.warn('[tomp4] m2 (direct webp):', e.message);
          }
        }

        // Method 3: converter.js toVideo fallback
        if (!done) {
          try {
            const { toVideo } = require('../../lib/converter');
            const converted = await toVideo(buffer, 'webp');
            if (converted?.length > 500) {
              fs.writeFileSync(tmpOut, converted);
              done = true;
            }
          } catch (e) {
            console.warn('[tomp4] m3 (converter.js):', e.message);
          }
        }

        if (!done) throw new Error('Semua metode konversi gagal. Pastikan ffmpeg & sharp terinstall');

      } else {
        // ── Video: re-encode untuk WA compatibility ──────────────────────
        try {
          await execAsync(
            `"${ffmpeg}" -y -i "${tmpIn}" ` +
            `-c:v libx264 -preset fast -crf 28 -pix_fmt yuv420p ` +
            `-c:a aac -b:a 128k -movflags +faststart "${tmpOut}"`,
            { timeout: 120000 }
          );
        } catch {
          // Kalau ffmpeg gagal, pakai buffer langsung
          fs.writeFileSync(tmpOut, buffer);
        }
      }

      mp4Buf = fs.readFileSync(tmpOut);
      const isGif  = command === 'togif';
      const sizeMB = (mp4Buf.length / 1048576).toFixed(2);

      await alya.sendMessage(m.chat, {
        video      : mp4Buf,
        mimetype   : 'video/mp4',
        gifPlayback: isGif,
        caption    :
          `✅ *Konversi Berhasil!*\n` +
          `🎬 Format : *${isGif ? 'GIF Loop' : 'MP4'}*\n` +
          `📦 Source : *${isSticker ? 'Stiker Animasi' : 'Video'}*\n` +
          `📊 Ukuran : *${sizeMB} MB*`
      }, { quoted: m });

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
      console.error('[tomp4] FINAL ERROR:', err.message);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {});
      replyalya(
        `❌ *Gagal Konversi ke MP4!*\n\n` +
        `_${err.message}_\n\n` +
        `*Tips:*\n` +
        `• Pastikan stiker yang direply adalah stiker *bergerak*\n` +
        `• Coba kirim ulang stikernya lalu reply lagi\n` +
        `• Pastikan ffmpeg terinstall di server`
      );
    } finally {
      for (const f of [tmpIn, tmpGif, tmpOut]) {
        try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch {}
      }
    }
  }
};
