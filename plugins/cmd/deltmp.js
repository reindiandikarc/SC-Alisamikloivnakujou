// ╔══════════════════════════════════════════════════════════════╗
// ║  DELTMP — Alya V13 Plugin                                   ║
// ║  Hapus semua file cache/sampah di folder tmp                ║
// ║  Commands: deltmp, cleartmp, hapustmp                       ║
// ╚══════════════════════════════════════════════════════════════╝
'use strict';

const fs   = require('fs');
const path = require('path');

// Daftar folder tmp yang dipakai di seluruh bot
const TMP_DIRS = [
  path.join(process.cwd(), 'tmp'),
  path.join(process.cwd(), 'tmp-temp'),
  '/tmp',
];

// File pattern yang aman untuk dihapus (buatan bot)
const SAFE_PATTERNS = [
  /^alya_/,
  /^tomp4_/,
  /^tofigure/,
  /^figure4/,
  /^in_\d+\.(mp3|ogg)$/,
  /^out_\d+\.(mp3|ogg)$/,
  /\.(mp4|mp3|webp|jpg|jpeg|png|gif|ogg|opus|webm|zip|pdf)$/i,
];

function isSafeToDelete(filename) {
  return SAFE_PATTERNS.some(p => p.test(filename));
}

function cleanDir(dirPath) {
  if (!fs.existsSync(dirPath)) return { deleted: 0, failed: 0, bytes: 0 };
  let deleted = 0, failed = 0, bytes = 0;
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      if (!isSafeToDelete(file)) continue;
      const fp = path.join(dirPath, file);
      try {
        const stat = fs.statSync(fp);
        if (!stat.isFile()) continue;
        bytes += stat.size;
        fs.unlinkSync(fp);
        deleted++;
      } catch {
        failed++;
      }
    }
  } catch {}
  return { deleted, failed, bytes };
}

function formatBytes(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}

module.exports = {
  command: ['deltmp', 'cleartmp', 'hapustmp'],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const { Ryuu, isOwn, isPT, isAdminP, replyalya, replytolak, prefix } = ctx;

    if (!Ryuu && !isOwn && !isPT && !isAdminP) {
      return replytolak('❌ Fitur ini khusus *Owner / Admin Bot*!');
    }

    await alya.sendMessage(m.chat, { react: { text: '🗑️', key: m.key } });

    let totalDeleted = 0, totalFailed = 0, totalBytes = 0;
    const results = [];

    for (const dir of TMP_DIRS) {
      const r = cleanDir(dir);
      totalDeleted += r.deleted;
      totalFailed  += r.failed;
      totalBytes   += r.bytes;
      if (r.deleted > 0 || r.failed > 0) {
        const label = dir.startsWith(process.cwd())
          ? './' + path.relative(process.cwd(), dir)
          : dir;
        results.push(`📁 *${label}*: ${r.deleted} dihapus${r.failed ? `, ${r.failed} gagal` : ''}`);
      }
    }

    await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    const teks = [
      `🗑️ *DELTMP — BERHASIL*`,
      ``,
      results.length ? results.join('\n') : `📁 Semua folder tmp sudah bersih.`,
      ``,
      `📊 *Ringkasan:*`,
      `🗂️ Total dihapus : ${totalDeleted} file`,
      `💾 Ruang bebas   : ${formatBytes(totalBytes)}`,
      totalFailed ? `⚠️ Gagal hapus   : ${totalFailed} file` : '',
    ].filter(Boolean).join('\n');

    replyalya(teks);
  },
};
