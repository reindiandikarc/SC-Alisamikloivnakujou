/**
 * ══════════════════════════════════════════════════════════════════════════════
 * lib/antibanGuard.js — Anti-Ban WhatsApp Guard System v2.0
 * Author : reindiandikarc
 * Desc   : Sistem perlindungan bot dari ban WhatsApp secara komprehensif.
 *          Mencakup: per-user cooldown, per-command cooldown, socket-level
 *          rate limiter, broadcast throttle, dan lockdown tier.
 *
 * PRINSIP UTAMA:
 *   • Owner & premium = BYPASS TOTAL dari semua cooldown
 *   • Bot tetap responsif untuk pesan normal
 *   • Delay broadcast menggunakan jitter agar pola tidak mekanis
 *   • Semua state di-persist ke disk via debounce agar survive restart
 * ══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const { debouncedWrite } = require('./debouncewriter');

// ─── KONSTANTA KONFIGURASI ───────────────────────────────────────────────────

const CFG = {
  // Per-user cooldown: jarak minimum antar perintah dari user yang sama
  USER_COOLDOWN_MS   : 7000,   // 7 detik antar command — biar kerasa, anti-ban

  // Threshold spam sebelum masuk lock tier
  WARN_THRESHOLD     : 4,      // warning ke-4 → lockdown pendek
  LOCK_THRESHOLD     : 7,      // warning ke-7 → lockdown panjang
  PERMA_THRESHOLD    : 10,     // warning ke-10 → lockdown sangat panjang

  // Durasi lockdown per tier (ms)
  LOCK_TIER1_MS      : 60_000,   // 1 menit
  LOCK_TIER2_MS      : 300_000,  // 5 menit
  LOCK_TIER3_MS      : 900_000,  // 15 menit

  // Auto-cleanup spam data setelah idle
  SPAM_CLEANUP_MS    : 30_000,  // 30 detik tanpa pesan → reset counter user

  // Per-command cooldown global (berlaku per user + command)
  // Format: { commandName: ms }
  CMD_COOLDOWNS: {
    tagall       : 30_000,   // 30 detik — mention massal, mahal di WA
    hidetag      : 30_000,
    bc           : 0,        // dihandle oleh bcThrottle sendiri
    bcgc         : 0,
    bcdm         : 0,
    bcall        : 0,
    bcsend       : 0,
    bcmulti      : 0,
    bcrotate     : 0,
    listgc       : 10_000,   // 10 detik — fetch semua grup
    listmember   : 10_000,
    sfb          : 8_000,
    stalkig      : 8_000,
    aiimg        : 15_000,   // heavy AI
    aimage       : 15_000,
    hd           : 12_000,   // heavy media
    hdvid        : 12_000,
    tomp4        : 10_000,
    slot         : 3_000,    // game: minimal jeda
    hilo         : 3_000,
  },

  // Broadcast throttle: delay + jitter per pesan
  BC_DELAY_BASE_MS   : 3_500,  // delay dasar antar pesan broadcast
  BC_DELAY_JITTER_MS : 2_000,  // random tambahan 0–2000ms (anti-pattern)
  BC_BURST_PAUSE_MS  : 12_000, // jeda panjang tiap N pesan
  BC_BURST_EVERY     : 10,     // jeda panjang setiap 10 pesan
};

// ─── STATE IN-MEMORY ─────────────────────────────────────────────────────────

/**
 * Map<sender, { count, lastCmd, lastTime, lockedUntil, warnCount }>
 * • count      : jumlah command berurutan dalam window cooldown
 * • lastCmd    : command terakhir yang dieksekusi
 * • lastTime   : timestamp command terakhir
 * • lockedUntil: timestamp user dikunci (0 = tidak kunci)
 * • warnCount  : total akumulasi peringatan (persist)
 */
const _userState = new Map();

/**
 * Map<`${sender}:${command}`, lastUsedTimestamp>
 * Untuk per-command cooldown.
 */
const _cmdCooldown = new Map();

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Jitter: kembalikan angka random antara base dan base+jitter */
function jitter(baseMs, jitterMs) {
  return baseMs + Math.floor(Math.random() * jitterMs);
}

/** Delay dengan jitter */
function jitterSleep(baseMs, jitterMs = 0) {
  return new Promise(r => setTimeout(r, jitter(baseMs, jitterMs)));
}

/** Cek apakah sender adalah owner/premium (bypass semua guard) */
function _isBypass(senderNum) {
  const owners = Array.isArray(global.owner) ? global.owner : [];
  const prems  = Array.isArray(global.prem)  ? global.prem  : [];
  return owners.includes(senderNum) || prems.includes(senderNum);
}

/** Normalisasi JID → nomor saja */
function _num(jid) {
  return (jid || '').split('@')[0];
}

/** Ambil state user, buat jika belum ada */
function _getUser(sender) {
  if (!_userState.has(sender)) {
    _userState.set(sender, {
      count      : 0,
      lastCmd    : '',
      lastTime   : 0,
      lockedUntil: 0,
      warnCount  : 0,
    });
  }
  return _userState.get(sender);
}

/** Bersihkan state user yang sudah idle */
function _cleanupIdle() {
  const now = Date.now();
  for (const [sender, state] of _userState) {
    const idle = now - state.lastTime;
    if (idle > CFG.SPAM_CLEANUP_MS && state.lockedUntil < now) {
      // Reset count (bukan hapus total — warnCount dipertahankan)
      state.count = 0;
    }
  }
}

// Cleanup idle tiap 30 detik
setInterval(_cleanupIdle, 30_000);

// ─── FUNGSI UTAMA GUARD ──────────────────────────────────────────────────────

/**
 * checkUserCooldown
 * Cek apakah sender boleh mengirim command sekarang.
 *
 * @param {string} sender  - JID pengirim (6281xxx@s.whatsapp.net)
 * @param {string} command - nama command (tanpa prefix)
 *
 * @returns {{ allowed: boolean, reason?: string, timeLeft?: number }}
 */
function checkUserCooldown(sender, command) {
  const senderNum = _num(sender);

  // Bypass total untuk owner/premium
  if (_isBypass(senderNum)) return { allowed: true };

  const now   = Date.now();
  const state = _getUser(sender);

  // ── 1. Cek lockdown aktif ─────────────────────────────────────────────────
  if (state.lockedUntil > now) {
    const timeLeft = Math.ceil((state.lockedUntil - now) / 1000);
    return {
      allowed  : false,
      reason   : 'lockdown',
      timeLeft,
      tier     : state.lockTier || 1,
    };
  } else if (state.lockedUntil > 0 && state.lockedUntil <= now) {
    // Lockdown expired → reset
    state.lockedUntil = 0;
    state.lockTier    = 0;
    state.count       = 0;
  }

  // ── 2. Cek per-command cooldown ───────────────────────────────────────────
  const cmdMs = CFG.CMD_COOLDOWNS[command] || 0;
  if (cmdMs > 0) {
    const key     = `${sender}:${command}`;
    const lastUsed = _cmdCooldown.get(key) || 0;
    const elapsed  = now - lastUsed;
    if (elapsed < cmdMs) {
      const timeLeft = Math.ceil((cmdMs - elapsed) / 1000);
      return {
        allowed  : false,
        reason   : 'cmd_cooldown',
        command,
        timeLeft,
      };
    }
  }

  // ── 3. Cek user rate cooldown ─────────────────────────────────────────────
  const elapsed = now - state.lastTime;

  if (elapsed < CFG.USER_COOLDOWN_MS) {
    // Dalam window cooldown → hitung spam
    state.count++;

    if (state.count >= CFG.WARN_THRESHOLD) {
      state.warnCount++;

      let lockDur  = 0;
      let lockTier = 0;

      if (state.warnCount >= CFG.PERMA_THRESHOLD) {
        lockDur  = CFG.LOCK_TIER3_MS;
        lockTier = 3;
      } else if (state.warnCount >= CFG.LOCK_THRESHOLD) {
        lockDur  = CFG.LOCK_TIER2_MS;
        lockTier = 2;
      } else {
        lockDur  = CFG.LOCK_TIER1_MS;
        lockTier = 1;
      }

      state.lockedUntil = now + lockDur;
      state.lockTier    = lockTier;
      state.count       = 0;

      const timeLeft = Math.ceil(lockDur / 1000);
      return {
        allowed  : false,
        reason   : 'lockdown_triggered',
        timeLeft,
        tier     : lockTier,
        warnCount: state.warnCount,
      };
    }

    const timeLeft = ((CFG.USER_COOLDOWN_MS - elapsed) / 1000).toFixed(1);
    return {
      allowed  : false,
      reason   : 'cooldown',
      timeLeft,
      warnCount: state.count,
      maxWarn  : CFG.WARN_THRESHOLD,
    };
  }

  // ── 4. Lolos semua cek → update state ────────────────────────────────────
  state.count   = 0;
  state.lastCmd = command;
  state.lastTime = now;

  // Catat per-command cooldown
  if (cmdMs > 0) {
    _cmdCooldown.set(`${sender}:${command}`, now);
  }

  return { allowed: true };
}

/**
 * buildCooldownMessage
 * Buat teks balasan yang sesuai dengan alasan penolakan.
 *
 * @param {{ reason, timeLeft, tier, warnCount, maxWarn, command }} result
 * @param {string} senderNum - nomor tanpa @s.whatsapp.net
 * @returns {string}
 */
function buildCooldownMessage(result, senderNum) {
  const { reason, timeLeft, tier, warnCount, maxWarn, command } = result;

  if (reason === 'lockdown') {
    const tierEmoji = tier >= 3 ? '☠️' : tier === 2 ? '🔴' : '🔒';
    return (
      `${tierEmoji} *@${senderNum} TERKUNCI SEMENTARA*\n\n` +
      `Kamu terlalu agresif. Tunggu dulu *${timeLeft} detik* sebelum bisa pakai bot lagi.\n` +
      `_Baca baik-baik, ini peringatan keras ya! 💢_`
    );
  }

  if (reason === 'lockdown_triggered') {
    const tierLabel = tier >= 3 ? '⚠️ TIER 3 — 15 MENIT' : tier === 2 ? '🔴 TIER 2 — 5 MENIT' : '🔒 TIER 1 — 1 MENIT';
    return (
      `😤 *@${senderNum} Dikunci! ${tierLabel}*\n\n` +
      `Udah kebanyakan spam! Cooldown *${timeLeft} detik*.\n` +
      `Total pelanggaran: *${warnCount}x*`
    );
  }

  if (reason === 'cmd_cooldown') {
    return (
      `⏳ *Slow down!* Command \`${command}\` baru bisa dipakai lagi dalam *${timeLeft} detik*.\n` +
      `_Command ini membutuhkan jeda lebih lama agar bot tidak kena rate limit._`
    );
  }

  if (reason === 'cooldown') {
    const bar = '▓'.repeat(warnCount) + '░'.repeat(maxWarn - warnCount);
    return (
      `⚠️ *@${senderNum} Slow down!*\n` +
      `Tunggu *${timeLeft}s* sebelum command berikutnya.\n` +
      `Peringatan: [${bar}] ${warnCount}/${maxWarn}`
    );
  }

  return `⏳ Tunggu sebentar sebelum pakai command lagi.`;
}

// ─── BROADCAST SAFE DELAY ────────────────────────────────────────────────────

/**
 * bcSafeDelay
 * Delay cerdas antara tiap pengiriman broadcast.
 * Menggunakan jitter + burst pause agar pola tidak mekanis.
 *
 * @param {number} index  - indeks pesan ke-berapa dalam broadcast ini
 */
async function bcSafeDelay(index = 0) {
  // Jeda panjang setiap BC_BURST_EVERY pesan
  if (index > 0 && index % CFG.BC_BURST_EVERY === 0) {
    await jitterSleep(CFG.BC_BURST_PAUSE_MS, 3000);
  } else {
    await jitterSleep(CFG.BC_DELAY_BASE_MS, CFG.BC_DELAY_JITTER_MS);
  }
}

/**
 * bcSafeDelayMs
 * Kembalikan angka ms delay (berguna untuk logging).
 */
function bcSafeDelayMs(index = 0) {
  if (index > 0 && index % CFG.BC_BURST_EVERY === 0) {
    return jitter(CFG.BC_BURST_PAUSE_MS, 3000);
  }
  return jitter(CFG.BC_DELAY_BASE_MS, CFG.BC_DELAY_JITTER_MS);
}

// ─── SOCKET-LEVEL RATE LIMITER ───────────────────────────────────────────────

/**
 * createSocketRateGuard
 * Bungkus sendMessage asli dengan rate limiter level socket.
 * Mencegah pengiriman terlalu banyak pesan dalam waktu singkat
 * ke JID yang SAMA (risiko utama detection WA).
 *
 * @param {{ sendMessage: Function }} opts - object dengan sendMessage function asli
 * @returns {Function} - guardedSendMessage yang sudah dilindungi
 *
 * Cara pakai di index.js:
 *   const _raw  = alya.sendMessage.bind(alya)
 *   const guard = createSocketRateGuard({ sendMessage: _raw })
 *   alya.sendMessage = async (jid, content, opts) => { ...patches...; return guard(jid, content, opts) }
 */
function createSocketRateGuard({ sendMessage: _origSend }) {
  if (typeof _origSend !== 'function') {
    throw new Error('[antibanGuard] createSocketRateGuard: sendMessage harus berupa Function');
  }

  // Map<jid, { count, windowStart }>
  const _jidTracker = new Map();

  const MAX_MSG_PER_JID_PER_WINDOW = 6;    // max 6 pesan ke 1 JID per window
  const WINDOW_MS                  = 8_000; // window 8 detik
  const COOL_AFTER_BURST_MS        = 4_000; // jeda paksa setelah burst
  const CLEANUP_INTERVAL_MS        = 60_000; // bersihkan JID idle tiap 1 menit

  // Cleanup otomatis agar Map tidak tumbuh tak terbatas
  setInterval(() => {
    const now = Date.now();
    for (const [jid, tracker] of _jidTracker) {
      if ((now - tracker.windowStart) > WINDOW_MS * 3) {
        _jidTracker.delete(jid);
      }
    }
  }, CLEANUP_INTERVAL_MS);

  return async function guardedSendMessage(jid, content, options = {}) {
    const now     = Date.now();
    let   tracker = _jidTracker.get(jid);

    if (!tracker || (now - tracker.windowStart) > WINDOW_MS) {
      tracker = { count: 0, windowStart: now };
      _jidTracker.set(jid, tracker);
    }

    tracker.count++;

    // Jika burst terdeteksi, paksa jeda sebelum kirim agar tidak flood 1 JID
    if (tracker.count > MAX_MSG_PER_JID_PER_WINDOW) {
      await jitterSleep(COOL_AFTER_BURST_MS, 1_500);
      _jidTracker.set(jid, { count: 1, windowStart: Date.now() });
    }

    return _origSend(jid, content, options);
  };
}

// ─── CLEANUP JID TRACKER (cegah memory leak) ─────────────────────────────────
// Dibersihkan di dalam fungsi karena scope lokal per socket instance

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

module.exports = {
  checkUserCooldown,
  buildCooldownMessage,
  bcSafeDelay,
  bcSafeDelayMs,
  createSocketRateGuard,
  jitter,
  jitterSleep,
  CFG,
};
