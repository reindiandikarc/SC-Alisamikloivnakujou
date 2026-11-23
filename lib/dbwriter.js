/**
 * dbwriter.js — Debounced / Batched Database Writer v2
 *
 * Perubahan dari v1:
 *  - FLUSH_INTERVAL_MS: 10s tetap, tapi tambah force-flush jika dirty > 30s
 *  - Tambah metrics: lastFlushTime, flushCount untuk debugging
 *  - _doFlush sekarang log waktu tulis jika > 50ms (deteksi disk bottleneck)
 */

'use strict';

const { safeWriteJSON } = require('./safewrite');
const DB_FILE            = './database/database.json';
const FLUSH_INTERVAL_MS  = 10_000; // tulis ke disk max 1x per 10 detik
const FORCE_FLUSH_AGE_MS = 30_000; // force flush jika dirty > 30 detik

let _isDirty       = false;
let _dirtyAt       = null;   // kapan terakhir markDirty dipanggil
let _flushTimer    = null;
let _isWriting     = false;
let _flushCount    = 0;
let _lastFlushTime = null;

function markDirty() {
    if (!_isDirty) {
        _isDirty = true;
        _dirtyAt = Date.now();
    }
    _scheduleFlush();
}

function _scheduleFlush() {
    if (_flushTimer) return;
    _flushTimer = setTimeout(async () => {
        _flushTimer = null;
        await _doFlush();
    }, FLUSH_INTERVAL_MS);
}

async function _doFlush() {
    if (!_isDirty || _isWriting) return;
    _isWriting = true;
    _isDirty   = false;
    _dirtyAt   = null;

    const t0 = Date.now();
    try {
        safeWriteJSON(DB_FILE, global.db);
        _flushCount++;
        _lastFlushTime = Date.now();

        const elapsed = _lastFlushTime - t0;
        if (elapsed > 50 && process.env.NODE_ENV !== 'production') {
            console.warn(`[DBWriter] ⚠️  Flush lambat: ${elapsed}ms — disk mungkin jadi bottleneck`);
        }
    } catch (err) {
        _isDirty = true; // retry berikutnya
        if (process.env.NODE_ENV !== 'production') {
            console.error('[DBWriter] Gagal flush:', err.message);
        }
    } finally {
        _isWriting = false;
    }
}

async function flushDB() {
    if (_flushTimer) {
        clearTimeout(_flushTimer);
        _flushTimer = null;
    }
    await _doFlush();
}

// Flush berkala + force flush jika terlalu lama dirty
setInterval(async () => {
    if (!_isDirty) return;
    // Force flush jika data sudah dirty > FORCE_FLUSH_AGE_MS
    const age = _dirtyAt ? Date.now() - _dirtyAt : 0;
    if (age > FORCE_FLUSH_AGE_MS || _isDirty) {
        await _doFlush();
    }
}, FLUSH_INTERVAL_MS);

process.on('exit', () => {
    if (_isDirty && global.db) {
        try { safeWriteJSON(DB_FILE, global.db); } catch (_) {}
    }
});

module.exports = { markDirty, flushDB };
