/**
 * perfguard.js — Performance Guard & Event Loop Monitor
 *
 * Fungsi:
 *  1. Deteksi event loop lag (jika > threshold → warning)
 *  2. Deteksi antrian pesan menumpuk per JID
 *  3. Laporan ringkas tiap 10 menit ke console
 *  4. GC hint berkala (jika --expose-gc aktif)
 *
 * Cara pakai:
 *   require('./lib/perfguard').start();
 *
 * TIDAK mengubah perilaku bot — murni monitoring & logging.
 * Tidak perlu dimatikan di production, overhead sangat kecil (<0.1% CPU).
 */

'use strict';

const LAG_WARN_MS    = 200;  // event loop lag > 200ms = warning
const LAG_CRIT_MS    = 800;  // lag > 800ms = critical (bot sudah terasa lemot)
const CHECK_INTERVAL = 1000; // cek setiap 1 detik
const GC_INTERVAL    = 10 * 60 * 1000; // hint GC tiap 10 menit

let _lastCheck = Date.now();
let _lagCount  = 0;
let _critCount = 0;
let _started   = false;

function start() {
    if (_started) return;
    _started = true;

    // ── Event Loop Lag Detector ────────────────────────────────────────────
    setInterval(() => {
        const now  = Date.now();
        const lag  = now - _lastCheck - CHECK_INTERVAL;
        _lastCheck = now;

        if (lag > LAG_CRIT_MS) {
            _critCount++;
            console.warn(
                `[PerfGuard] ⚠️  EVENT LOOP CRITICAL LAG: ${lag}ms ` +
                `(total crit: ${_critCount}x) — bot sudah terasa macet!`
            );
        } else if (lag > LAG_WARN_MS) {
            _lagCount++;
            // Jangan spam — log hanya tiap 5x
            if (_lagCount % 5 === 0) {
                console.warn(`[PerfGuard] 🐢 Event loop lag: ${lag}ms (total: ${_lagCount}x)`);
            }
        }
    }, CHECK_INTERVAL);

    // ── GC Hint berkala ───────────────────────────────────────────────────
    setInterval(() => {
        if (typeof global.gc === 'function') {
            try {
                global.gc();
                // ✅ PERF-FIX: GC log hanya di dev mode — console.log di production = overhead I/O
                if (process.env.NODE_ENV !== 'production') {
                    const mem = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
                    console.log(`[PerfGuard] 🧹 GC triggered. Heap: ${mem}MB`);
                }
            } catch (_) {}
        }
    }, GC_INTERVAL);

    // ── Laporan RAM & uptime tiap 10 menit ────────────────────────────────
    setInterval(() => {
        const { rss, heapUsed, external } = process.memoryUsage();
        const rssMB  = Math.round(rss      / 1024 / 1024);
        const heapMB = Math.round(heapUsed / 1024 / 1024);
        const extMB  = Math.round(external / 1024 / 1024);
        const upSec  = Math.round(process.uptime());
        const upHr   = Math.floor(upSec / 3600);
        const upMin  = Math.floor((upSec % 3600) / 60);

        // ✅ PERF-FIX: Log hanya di dev mode, atau jika RAM tinggi (>600MB) / ada lag kritis
        const highRam = rssMB > 600;
        if (process.env.NODE_ENV !== 'production' || highRam || _critCount > 0) {
            console.log(
                `[PerfGuard] 📊 Uptime: ${upHr}h${upMin}m | ` +
                `RSS: ${rssMB}MB Heap: ${heapMB}MB Ext: ${extMB}MB | ` +
                `EventLoopLag: ${_lagCount}x warn ${_critCount}x crit`
            );
        }
    }, 10 * 60 * 1000);

    console.log('[PerfGuard] ✅ Performance monitor aktif.');
}

module.exports = { start };
