// ╔══════════════════════════════════════════════════════════════╗
// ║  AUTODELTMP — Alya V13 Plugin                               ║
// ║  Auto-hapus file tmp otomatis begitu ada file masuk         ║
// ║  Commands: autodeltmp                                       ║
// ╚══════════════════════════════════════════════════════════════╝
'use strict';

const fs   = require('fs');
const path = require('path');

// ── State file (persist toggle restart bot) ──────────────────────────────
const STATE_FILE = path.join(process.cwd(), 'database', 'autodeltmp.json');

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    }
  } catch {}
  return { enabled: false };
}

function saveState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch {}
}

// ── Folder yang dipantau ─────────────────────────────────────────────────
const WATCH_DIRS = [
  path.join(process.cwd(), 'tmp'),
  path.join(process.cwd(), 'tmp-temp'),
  // /tmp sengaja tidak di-watch karena sistem OS juga pakai
];

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

// ── Watcher manager ──────────────────────────────────────────────────────
const _watchers = new Map();

function startWatcher(dirPath, logFn) {
  if (_watchers.has(dirPath)) return; // sudah jalan
  if (!fs.existsSync(dirPath)) {
    try { fs.mkdirSync(dirPath, { recursive: true }); } catch { return; }
  }

  const watcher = fs.watch(dirPath, (eventType, filename) => {
    if (!filename || eventType !== 'rename') return;
    if (!isSafeToDelete(filename)) return;

    const fp = path.join(dirPath, filename);
    // Tunggu sebentar — file mungkin masih ditulis
    setTimeout(() => {
      try {
        if (fs.existsSync(fp) && fs.statSync(fp).isFile()) {
          fs.unlinkSync(fp);
          logFn && logFn(`[AUTODELTMP] Dihapus: ${filename} dari ${dirPath}`);
        }
      } catch {}
    }, 2000); // 2 detik setelah file masuk baru hapus
  });

  watcher.on('error', () => stopWatcher(dirPath));
  _watchers.set(dirPath, watcher);
}

function stopWatcher(dirPath) {
  const w = _watchers.get(dirPath);
  if (w) {
    try { w.close(); } catch {}
    _watchers.delete(dirPath);
  }
}

function stopAllWatchers() {
  for (const dir of _watchers.keys()) stopWatcher(dir);
}

// ── Auto-init saat module di-require (jika state enabled) ────────────────
const initState = loadState();
if (initState.enabled) {
  for (const dir of WATCH_DIRS) {
    startWatcher(dir, (msg) => console.log(msg));
  }
}

// ── Plugin command ────────────────────────────────────────────────────────
module.exports = {
  command: ['autodeltmp'],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const { args, Ryuu, isOwn, isPT, isAdminP, replyalya, replytolak } = ctx;

    if (!Ryuu && !isOwn && !isPT && !isAdminP) {
      return replytolak('❌ Fitur ini khusus *Owner / Admin Bot*!');
    }

    const state = loadState();
    const sub = (args[0] || '').toLowerCase();

    // ── Status ──
    if (sub === 'status' || sub === 'info' || sub === 'cek') {
      const dirs = WATCH_DIRS.map(d => {
        const exists  = fs.existsSync(d);
        const watched = _watchers.has(d);
        const label   = './' + path.relative(process.cwd(), d);
        return `📁 ${label}: ${exists ? (watched ? '👁️ dipantau' : '⏸️ ada, tidak dipantau') : '❌ belum dibuat'}`;
      });

      return replyalya([
        `🤖 *AUTODELTMP — STATUS*`,
        ``,
        `Status  : ${state.enabled ? '✅ *AKTIF*' : '❌ *NONAKTIF*'}`,
        `Watcher : ${_watchers.size} folder aktif`,
        ``,
        `📂 *Folder yang dipantau:*`,
        ...dirs,
        ``,
        `📌 Ketik *.autodeltmp on/off* untuk toggle`,
      ].join('\n'));
    }

    // ── ON ──
    if (sub === 'on' || sub === '1') {
      if (state.enabled) {
        return replyalya('ℹ️ AUTODELTMP sudah *AKTIF*. Tidak ada perubahan.');
      }
      state.enabled = true;
      saveState(state);
      for (const dir of WATCH_DIRS) {
        startWatcher(dir, (msg) => console.log(msg));
      }
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      return replyalya([
        `✅ *AUTODELTMP — DIAKTIFKAN*`,
        ``,
        `Setiap file yang masuk ke folder *tmp* akan`,
        `dihapus otomatis dalam *2 detik* setelah terdeteksi.`,
        ``,
        `📂 Folder dipantau:`,
        ...WATCH_DIRS.map(d => `  • ./${path.relative(process.cwd(), d)}`),
        ``,
        `📌 Gunakan *.autodeltmp off* untuk mematikan.`,
      ].join('\n'));
    }

    // ── OFF ──
    if (sub === 'off' || sub === '0') {
      if (!state.enabled) {
        return replyalya('ℹ️ AUTODELTMP sudah *NONAKTIF*. Tidak ada perubahan.');
      }
      state.enabled = false;
      saveState(state);
      stopAllWatchers();
      await alya.sendMessage(m.chat, { react: { text: '🔴', key: m.key } });
      return replyalya([
        `🔴 *AUTODELTMP — DIMATIKAN*`,
        ``,
        `Auto-hapus file tmp telah dinonaktifkan.`,
        `File di folder tmp tidak akan otomatis dihapus.`,
        ``,
        `📌 Gunakan *.autodeltmp on* untuk mengaktifkan kembali.`,
      ].join('\n'));
    }

    // ── Help (default) ──
    replyalya([
      `🤖 *AUTODELTMP — HELP*`,
      ``,
      `Command ini mengaktifkan pemantauan folder *tmp*`,
      `dan otomatis menghapus file sampah begitu ada yang masuk.`,
      ``,
      `🔧 *Penggunaan:*`,
      `  • *.autodeltmp on*     — Aktifkan auto-hapus`,
      `  • *.autodeltmp off*    — Nonaktifkan auto-hapus`,
      `  • *.autodeltmp status* — Lihat status watcher`,
      ``,
      `⚙️ *Detail:*`,
      `  • File dihapus 2 detik setelah terdeteksi`,
      `  • Status persist meski bot di-restart`,
      `  • Hanya hapus file media/cache bot (aman)`,
      ``,
      `💡 Status sekarang: ${state.enabled ? '✅ *AKTIF*' : '❌ *NONAKTIF*'}`,
    ].join('\n'));
  },
};
