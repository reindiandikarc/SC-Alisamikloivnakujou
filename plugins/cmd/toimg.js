// Plugin: toimg
// Alya V13 — Convert stiker/WebP ke gambar (JPG/PNG)
// Mirip Bell SC: download media → kirim sebagai image langsung
// Commands: toimg, toimage, stktoimg

'use strict';

const path = require('path');
const fs   = require('fs');
const { execSync } = require('child_process');
const { promisify } = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);

function getFfmpegPath() {
  if (global.FFMPEG_PATH) return global.FFMPEG_PATH;
  try { const p = require('ffmpeg-static'); if (p && fs.existsSync(p)) return p; } catch {}
  try { const p = require('@ffmpeg-installer/ffmpeg').path; if (p && fs.existsSync(p)) return p; } catch {}
  try { execSync('ffmpeg -version', { stdio: 'pipe', timeout: 5000 }); return 'ffmpeg'; } catch {}
  return null;
}

module.exports = {
  command: ['toimg', 'toimage', 'stktoimg'],
  tags: ['converter'],
  run: async (alya, m, ctx) => {
    const { prefix, command, quoted, mime, replyalya } = ctx;

    if (!quoted) {
      return replyalya(
        `📸 *TO IMAGE*\n\n` +
        `Reply *stiker* atau *gambar WebP* dengan *${prefix}${command}*\n\n` +
        `Bot akan mengconvert ke JPG dan mengirimkannya.`
      );
    }

    const qMime = quoted?.message?.stickerMessage
      ? 'image/webp'
      : (quoted.mimetype || mime || '');

    const isSticker = /webp/i.test(qMime) ||
      !!quoted?.message?.stickerMessage ||
      quoted?.type === 'stickerMessage';
    const isImage   = /image/i.test(qMime);

    if (!isSticker && !isImage) {
      return replyalya('❌ Harus reply *stiker* atau *gambar*!');
    }

    await alya.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

    const tmpIn  = path.join('/tmp', `alya_toimg_in_${Date.now()}.webp`);
    const tmpOut = path.join('/tmp', `alya_toimg_out_${Date.now()}.jpg`);

    try {
      // Download media buffer
      const buffer = await quoted.download();
      if (!buffer || !buffer.length) throw new Error('Buffer media kosong');

      // Cek apakah stiker animasi
      const isAnimated = quoted?.message?.stickerMessage?.isAnimated === true;

      if (isAnimated) {
        // Stiker animasi → ambil frame pertama saja via ffmpeg
        const ffmpeg = getFfmpegPath();
        if (!ffmpeg) {
          return replyalya(
            '❌ *ffmpeg tidak ditemukan!*\n\n' +
            'Install ffmpeg:\n• VPS: `sudo apt install ffmpeg`\n• Termux: `pkg install ffmpeg`'
          );
        }
        fs.writeFileSync(tmpIn, buffer);
        await execAsync(
          `"${ffmpeg}" -y -i "${tmpIn}" -vframes 1 -q:v 2 "${tmpOut}"`,
          { timeout: 30000 }
        );
        if (!fs.existsSync(tmpOut)) throw new Error('Gagal konversi frame stiker animasi');
        const imgBuf = fs.readFileSync(tmpOut);
        await alya.sendMessage(m.chat, { image: imgBuf, caption: '✅ Stiker animasi → Gambar (frame pertama)' }, { quoted: m });
      } else {
        // Stiker biasa / gambar webp → kirim langsung sebagai image
        // Bell approach: langsung sendMessage dengan { image: buffer }
        await alya.sendMessage(m.chat, { image: buffer }, { quoted: m });
      }

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
      console.error('[toimg]', err.message);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {});
      replyalya(`❌ *Gagal konversi!*\n\n_${err.message}_`);
    } finally {
      try { if (fs.existsSync(tmpIn))  fs.unlinkSync(tmpIn);  } catch {}
      try { if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut); } catch {}
    }
  }
};
