// Plugin: playvideo
// Commands: playvideo, pvideo
// Download video YouTube via yt-dlp (no fallback, single method)
// Versi video dari .play — kirim video bukan audio

const { exec } = require('child_process');
const fs   = require('fs');
const path = require('path');
const { promisify } = require('util');
const execAsync = promisify(exec);

// ── Lock anti-double-run per message key ──────────────────────────────────────
const _processing = new Set();

function getYtDlp() {
  if (global.YTDLP_PATH) return global.YTDLP_PATH;
  try {
    require('child_process').execSync('yt-dlp --version', { stdio: 'pipe' });
    return 'yt-dlp';
  } catch {}
  return null;
}

function getFfmpeg() {
  if (global.FFMPEG_PATH) return global.FFMPEG_PATH;
  try { const p = require('ffmpeg-static'); if (p && fs.existsSync(p)) return p; } catch {}
  try { const p = require('@ffmpeg-installer/ffmpeg').path; if (p && fs.existsSync(p)) return p; } catch {}
  return 'ffmpeg';
}

// ── Ambil info video ──────────────────────────────────────────────────────────
async function getVideoInfo(ytdlp, query) {
  const isUrl = /^https?:\/\//i.test(query);
  const target = isUrl
    ? `"${query}"`
    : `"ytsearch1:${query.replace(/"/g, '')}"`;
  const { stdout } = await execAsync(
    `"${ytdlp}" --dump-json --no-playlist --no-warnings ${target}`,
    { timeout: 30_000, maxBuffer: 5 * 1024 * 1024 }
  );
  return JSON.parse(stdout.trim().split('\n')[0]);
}

// ── Download video (single method, yt-dlp only) ───────────────────────────────
async function downloadVideo(ytdlp, ffmpeg, url, outId) {
  const outBase = path.join('/tmp', `alya_pvideo_${outId}`);
  const ffmpegArg = ffmpeg ? `--ffmpeg-location "${ffmpeg}"` : '';
  const nicePrefix = process.platform !== 'win32' ? 'nice -n 10 ' : '';

  // Pilih video ≤720p agar tidak terlalu besar, mp4 output
  const formatSelect = `bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=720]+bestaudio/best[height<=720]/best`;

  const cmd = [
    `${nicePrefix}"${ytdlp}"`,
    `-f "${formatSelect}"`,
    '--merge-output-format mp4',
    '--no-playlist',
    '--no-warnings',
    '--concurrent-fragments 1',
    ffmpegArg,
    '-o', `"${outBase}.%(ext)s"`,
    `"${url}"`
  ].filter(Boolean).join(' ');

  await execAsync(cmd, { timeout: 300_000, maxBuffer: 50 * 1024 * 1024 });

  for (const ext of ['mp4', 'mkv', 'webm']) {
    const p = `${outBase}.${ext}`;
    if (fs.existsSync(p)) return p;
  }
  const found = fs.readdirSync('/tmp').find(f => f.startsWith(`alya_pvideo_${outId}`));
  if (found) return path.join('/tmp', found);
  throw new Error('File video tidak ditemukan setelah download');
}

function cleanTemp(p) {
  try { if (p && fs.existsSync(p)) fs.unlinkSync(p); } catch {}
}

function fmtViews(n) {
  if (typeof n !== 'number') return 'N/A';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'jt';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'rb';
  return n.toString();
}
function fmtDur(s) {
  if (!s) return 'N/A';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
    : `${m}:${String(sec).padStart(2,'0')}`;
}
function fmtSize(b) {
  if (!b) return 'N/A';
  return b >= 1_000_000 ? (b / 1_000_000).toFixed(1) + ' MB' : (b / 1_000).toFixed(0) + ' KB';
}
function fmtDate(s) {
  if (!s || s.length < 8) return 'N/A';
  return `${s.slice(6,8)}/${s.slice(4,6)}/${s.slice(0,4)}`;
}

module.exports = {
  command: ['playvideo', 'pvideo'],
  tags: ['downloader'],
  run: async (alya, m, ctx) => {
    const { command, text, prefix, reply, replyalya } = ctx;

    if (!text) return replyalya(
      `╭─「 🎬 *PLAY VIDEO* 」\n` +
      `│\n` +
      `│ Download video dari YouTube via *yt-dlp*\n` +
      `│ Kualitas maksimal 720p\n` +
      `│\n` +
      `│ *Cara pakai:*\n` +
      `│ ${prefix}${command} <judul video / URL>\n` +
      `│\n` +
      `│ *Contoh:*\n` +
      `│ ${prefix}${command} Silhouette KANA-BOON MV\n` +
      `│ ${prefix}${command} https://youtu.be/xxxx\n` +
      `╰──────────────────`
    );

    // ── Anti-double-run ──
    const lockKey = m.key?.id || `${m.chat}_${Date.now()}`;
    if (_processing.has(lockKey)) return;
    _processing.add(lockKey);

    const ytdlp  = getYtDlp();
    const ffmpeg = getFfmpeg();

    if (!ytdlp) {
      _processing.delete(lockKey);
      return replyalya(
        `❌ *yt-dlp belum terinstall!*\n\n` +
        `Install manual:\n` +
        `*Ubuntu/Debian:* \`pip3 install yt-dlp\`\n` +
        `*Termux:* \`pkg install python && pip install yt-dlp\`\n\n` +
        `_Setelah install, restart bot._`
      );
    }

    const outId = Date.now();
    let tempFile = null;

    try {
      await alya.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

      // ── Ambil info video ──
      let info;
      try {
        info = await getVideoInfo(ytdlp, text);
      } catch {
        await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return replyalya(
          `❌ *Video tidak ditemukan!*\n\n` +
          `Tips:\n• Tulis judul lebih spesifik\n• Tambahkan nama artis / kata kunci\n• Atau gunakan URL langsung`
        );
      }

      // ── Cek durasi (max 5 menit untuk video) ──
      if (info.duration && info.duration > 300) {
        await alya.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
        return replyalya(
          `⚠️ *Video terlalu panjang!*\n\n` +
          `• Durasi: *${fmtDur(info.duration)}*\n` +
          `• Batas .playvideo: *5:00*\n\n` +
          `_Gunakan ${prefix}ytmp4 untuk video panjang_`
        );
      }

      const title    = info.title     || 'Unknown Title';
      const uploader = info.uploader  || info.channel || 'Unknown';
      const url      = info.webpage_url || info.url;
      const thumb    = info.thumbnail;

      const caption =
        `🎬 *${title}*\n` +
        `┌─────────────────\n` +
        `│ 👤 *Channel :* ${uploader}\n` +
        `│ ⏱️ *Durasi   :* ${fmtDur(info.duration)}\n` +
        `│ 📅 *Upload   :* ${fmtDate(info.upload_date)}\n` +
        `│ 👁️ *Views    :* ${fmtViews(info.view_count)}\n` +
        `│ 💾 *Estimasi :* ${fmtSize(info.filesize_approx)}\n` +
        `│ 📺 *Kualitas :* ≤720p\n` +
        `└─────────────────\n` +
        `\n_⏳ Download via yt-dlp, harap tunggu..._`;

      // Kirim info thumbnail
      try {
        await alya.sendMessage(m.chat,
          thumb
            ? { image: { url: thumb }, caption, mentions: [m.sender] }
            : { text: caption },
          { quoted: m }
        );
      } catch {
        await reply(caption);
      }

      await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

      // ── Download video ──
      tempFile = await downloadVideo(ytdlp, ffmpeg, url, outId);

      // Kirim video — TANPA contextInfo agar tidak ada link preview
      await alya.sendMessage(m.chat, {
        video: { url: tempFile },
        caption: `🎬 *${title}*\n👤 ${uploader}`,
        mimetype: 'video/mp4',
        fileName: `${title.replace(/[<>:"/\\|?*]/g, '')}.mp4`,
      }, { quoted: m });

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
      console.error('[playvideo.js error]', err.message);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

      let msg = err.message || 'Unknown error';
      if (/Video unavailable|Private video/i.test(msg))  msg = 'Video tidak tersedia atau privat';
      else if (/Sign in|age.restrict/i.test(msg))        msg = 'Video membutuhkan login / batasan usia';
      else if (/timeout/i.test(msg))                     msg = 'Timeout — koneksi lambat, coba lagi';
      else if (/ffmpeg|ffprobe/i.test(msg))              msg = 'ffmpeg error — coba restart bot';
      else if (/ERROR: \[youtube\]/i.test(msg))          msg = msg.replace(/^.*ERROR: /, '');

      replyalya(`❌ *Download gagal!*\n\n*Error:* ${msg}\n\n_Coba lagi atau gunakan ${prefix}ytmp4 <url>_`);
    } finally {
      cleanTemp(tempFile);
      _processing.delete(lockKey);
    }
  }
};
