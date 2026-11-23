/**
 * msgqueue.js — Parallel Multi-Group Queue v3
 *
 * ARSITEKTUR:
 * ┌──────────────────────────────────────────────────────────┐
 * │  TIER 0 — Priority Lane  (Owner)                        │
 * │  → setImmediate langsung, TIDAK masuk queue sama sekali  │
 * ├──────────────────────────────────────────────────────────┤
 * │  TIER 1 — Fast Lane  (Non-command: chat, media, dsb)    │
 * │  → setImmediate langsung, TIDAK masuk queue sama sekali  │
 * ├──────────────────────────────────────────────────────────┤
 * │  TIER 2 — Per-JID Parallel Queue  (Command biasa)       │
 * │                                                          │
 * │  Grup A ──→ [cmd1, cmd2, cmd3]  ──→ Worker Pool         │
 * │  Grup B ──→ [cmd1, cmd2]        ──→ Worker Pool         │
 * │  Grup C ──→ [cmd1]              ──→ Worker Pool         │
 * │                                                          │
 * │  Tiap JID punya SLOT PARALEL SENDIRI (CONCURRENCY_PER_JID)
 * │  Semua JID bisa jalan BERSAMAAN dalam batas GLOBAL_SLOTS │
 * └──────────────────────────────────────────────────────────┘
 *
 * KUNCI DESAIN: "Per-JID Semaphore + Global Pool"
 *
 * Problem lama (v2):
 *   GLOBAL_CONCURRENCY = 8 berarti cuma 8 slot total untuk SEMUA grup.
 *   Jika ada 20 grup aktif bersamaan, 12 grup harus antre.
 *   Bot terasa responsif di 1 grup, tapi grup lain nunggu giliran.
 *
 * Solusi baru (v3):
 *   - CONCURRENCY_PER_JID = 3  → tiap grup bisa proses 3 command sekaligus
 *   - GLOBAL_SLOTS = 32        → total slot sistem (bukan per-grup)
 *   - Jika ada 10 grup aktif   → 10 × 3 = 30 slot terpakai, masih aman
 *   - Jika ada 20 grup aktif   → capped di 32 slot, round-robin fairness
 *   - Tidak ada 1 grup yang bisa ambil semua 32 slot (dibatasi 3 per JID)
 *
 * Hasilnya: SEMUA grup diproses bersamaan, bukan satu-satu.
 */

'use strict';

// ── Konstanta ─────────────────────────────────────────────────────────────────
// ✅ PERF-FIX: Slot ditingkatkan 32→48 untuk bot dengan banyak grup aktif.
//   48 slot cukup untuk ~16 grup (3 slot/grup) bersamaan tanpa delay.
//   TASK_TIMEOUT dikurangi 22s→18s: slot macet bebas 4 detik lebih cepat.
const GLOBAL_SLOTS       = 48;   // ✅ dari 32 → 48 (lebih banyak grup paralel)
const CONCURRENCY_PER_JID = 3;   // max slot yang bisa dipakai 1 grup/user
const TASK_TIMEOUT_MS    = 18_000; // ✅ dari 22s → 18s (slot macet bebas lebih cepat)
const MAX_QUEUE_PER_JID  = 20;   // ✅ dari 15 → 20 (antrian per grup lebih longgar)
const MAX_TOTAL_QUEUE    = 400;  // ✅ dari 300 → 400 (hard cap lebih tinggi)

// ── State tracking per-JID ───────────────────────────────────────────────────
// Map<jid, { running: number, queue: Array }>
const _jidState = new Map();

// Global slot counter
let _globalRunning = 0;
let _totalQueued   = 0;

// Stats
const _stats = {
    processed : 0,
    dropped   : 0,
    timedOut  : 0,
    instant   : 0,
    priority  : 0,
    latencies : [],   // ring buffer 200 sample untuk p95
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function _getJidState(jid) {
    if (!_jidState.has(jid)) {
        _jidState.set(jid, { running: 0, queue: [] });
    }
    return _jidState.get(jid);
}

function _cleanJidState(jid) {
    const s = _jidState.get(jid);
    if (s && s.running === 0 && s.queue.length === 0) {
        _jidState.delete(jid);
    }
}

function _recordLatency(ms) {
    if (_stats.latencies.length >= 200) _stats.latencies.shift();
    _stats.latencies.push(ms);
}

function _p95() {
    if (_stats.latencies.length === 0) return 0;
    const sorted = [..._stats.latencies].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length * 0.95)] ?? sorted[sorted.length - 1];
}

// ── Core runner untuk 1 task ─────────────────────────────────────────────────

function _runTask(jid, task) {
    const state = _getJidState(jid);
    state.running++;
    _globalRunning++;
    _totalQueued--;

    const startTime = Date.now();

    const raceResult = Promise.race([
        Promise.resolve().then(task.fn),
        new Promise((_, rej) =>
            setTimeout(() => rej(new Error('TASK_TIMEOUT')), TASK_TIMEOUT_MS)
        ),
    ]);

    raceResult
        .catch(err => {
            if (err?.message === 'TASK_TIMEOUT') _stats.timedOut++;
        })
        .finally(() => {
            _recordLatency(Date.now() - startTime);
            _stats.processed++;
            state.running--;
            _globalRunning--;

            // Segera coba drain antrian JID ini dulu (LIFO locality — responsif)
            _drainJid(jid);
            // Lalu drain JID lain yang mungkin menunggu slot global
            _drainAll();

            _cleanJidState(jid);
        });
}

// Drain antrian 1 JID selama ada slot tersedia
function _drainJid(jid) {
    const state = _jidState.get(jid);
    if (!state) return;

    while (
        state.queue.length > 0 &&
        state.running < CONCURRENCY_PER_JID &&
        _globalRunning < GLOBAL_SLOTS
    ) {
        const task = state.queue.shift();
        _runTask(jid, task);
    }
}

// Round-robin drain semua JID yang masih punya antrian
function _drainAll() {
    if (_globalRunning >= GLOBAL_SLOTS || _totalQueued === 0) return;

    for (const [jid] of _jidState) {
        if (_globalRunning >= GLOBAL_SLOTS) break;
        _drainJid(jid);
    }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * TIER 0: Owner command → bypass total, langsung jalan
 */
function runPriority(fn) {
    _stats.priority++;
    setImmediate(() => {
        Promise.resolve().then(fn).catch(() => {});
    });
}

/**
 * TIER 1: Non-command (chat biasa, sticker, media) → langsung
 */
function runInstant(fn) {
    _stats.instant++;
    setImmediate(() => {
        Promise.resolve().then(fn).catch(() => {});
    });
}

/**
 * TIER 2: Command biasa → masuk per-JID queue
 * @param {Function} fn   - handler async
 * @param {string}   jid  - JID grup/user (untuk isolasi fairness)
 */
function pushCommand(fn, jid = 'global') {
    // Hard cap global
    if (_totalQueued >= MAX_TOTAL_QUEUE) {
        _stats.dropped++;
        return;
    }

    const state = _getJidState(jid);

    // Hard cap per JID
    if (state.queue.length >= MAX_QUEUE_PER_JID) {
        _stats.dropped++;
        return;
    }

    // Jika slot JID masih ada DAN global masih ada → langsung jalan tanpa antri
    if (state.running < CONCURRENCY_PER_JID && _globalRunning < GLOBAL_SLOTS) {
        _totalQueued++;  // _runTask akan decrement
        _runTask(jid, { fn });
        return;
    }

    // Sinomm: masuk antrian
    state.queue.push({ fn });
    _totalQueued++;
}

/**
 * Stats untuk monitoring
 */
function getStats() {
    return {
        globalRunning : _globalRunning,
        globalSlots   : GLOBAL_SLOTS,
        totalQueued   : _totalQueued,
        activeJids    : _jidState.size,
        processed     : _stats.processed,
        timedOut      : _stats.timedOut,
        dropped       : _stats.dropped,
        instant       : _stats.instant,
        priority      : _stats.priority,
        p95LatencyMs  : _p95(),
    };
}

// ── Log berkala ───────────────────────────────────────────────────────────────
// ✅ PERF-FIX: Log hanya di dev mode, atau tiap 10 menit jika ada masalah (timeout/drop)
setInterval(() => {
    const s = getStats();
    const hasIssue = s.timedOut > 0 || s.dropped > 0;
    if (process.env.NODE_ENV !== 'production' || hasIssue) {
        if (s.processed > 0 || s.globalRunning > 0) {
            console.log(
                `[Queue/v3] run:${s.globalRunning}/${s.globalSlots} ` +
                `queued:${s.totalQueued} jids:${s.activeJids} ` +
                `done:${s.processed} timeout:${s.timedOut} drop:${s.dropped} ` +
                `instant:${s.instant} prio:${s.priority} p95:${s.p95LatencyMs}ms`
            );
        }
    }
}, 10 * 60 * 1000); // ✅ PERF-FIX: 5min → 10min interval log

// ── Singleton interface (kompatibel dengan kode lama) ────────────────────────
// Ekspor sebagai `queue` object agar index.js tidak perlu diubah
const queue = {
    runPriority,
    runInstant,
    pushCommand,
    get stats() { return getStats(); },
};

module.exports = { queue, runPriority, runInstant, pushCommand, getStats };
