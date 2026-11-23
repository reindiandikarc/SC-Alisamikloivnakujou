/**
 * lib/ownerReport.js — Auto-Report ke Owner (Alya V20)
 * ─────────────────────────────────────────────────────────────────────────────
 * Tujuan: owner SELALU tahu kondisi bot tanpa harus cek panel/SSH manual.
 *
 * Mengirim WhatsApp ke nomor owner pada momen-momen kritis:
 *   1. Bot berhasil online / connect           → "Alya online"
 *   2. uncaughtException (bug fatal di kode)    → detail error + auto-restart
 *   3. unhandledRejection (Promise gagal)       → detail error
 *   4. Sinyal SIGTERM/SIGINT (PM2 stop/restart) → graceful shutdown notice
 *   5. RAM melebihi batas (dipanggil dari MemWatcher) → notice + restart
 *
 * PENTING — Anti-Spam:
 *   Banyak error yang sama beruntun (misal loop crash) JANGAN bikin owner
 *   di-spam ratusan pesan per detik. Maka ada throttle per jenis report:
 *   - Sama jenis report dalam waktu < COOLDOWN_MS → SKIP (tidak kirim ulang)
 *   - Setelah cooldown habis, baru boleh kirim lagi
 *
 * PENTING — Tidak boleh bikin proses tambah hang:
 *   Saat uncaughtException/SIGTERM, proses Node bisa dalam keadaan tidak
 *   stabil. Maka pengiriman WA dibungkus try/catch + timeout race, supaya
 *   GAGAL KIRIM TIDAK PERNAH menahan proses exit/restart lebih lama dari
 *   REPORT_TIMEOUT_MS.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

// ✅ FIX: sebelumnya OWNER_JID dihitung SEKALI saat module di-require
// (top-level const), jadi kalau global.ownernomer berubah belakangan
// (misal lewat command owner di runtime), notifikasi tetap terkirim ke
// nomor LAMA selamanya sampai proses di-restart. Sekarang jadi fungsi
// yang dibaca ulang setiap kali owner perlu dihubungi.
function getOwnerJid() {
    return (global.ownernomer || '6285602845943') + '@s.whatsapp.net';
}
const COOLDOWN_MS = 30_000;       // 30 detik — jangan spam report jenis yang sama
const REPORT_TIMEOUT_MS = 5_000;  // max nunggu 5 detik buat kirim WA sebelum proses lanjut

const _lastSent = new Map(); // key: jenis report -> timestamp terakhir terkirim

function _now() {
    try {
        const moment = require('moment-timezone');
        return moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss') + ' WIB';
    } catch {
        return new Date().toISOString();
    }
}

function _shouldThrottle(key) {
    const last = _lastSent.get(key);
    const now = Date.now();
    if (last && (now - last) < COOLDOWN_MS) return true;
    _lastSent.set(key, now);
    return false;
}

function _trim(str, max = 1200) {
    if (!str) return '-';
    str = String(str);
    return str.length > max ? str.slice(0, max) + '\n... (dipotong)' : str;
}

/**
 * Kirim pesan teks ke owner dengan timeout race + silent-fail.
 * TIDAK PERNAH throw — supaya pemanggil (uncaughtException dll) tidak
 * ikut crash gara-gara gagal kirim WA.
 */
async function _safeSend(text) {
    if (!global.alya || typeof global.alya.sendMessage !== 'function') {
        console.log('[ownerReport] socket belum siap, skip kirim ke owner');
        return false;
    }
    try {
        await Promise.race([
            global.alya.sendMessage(getOwnerJid(), { text }),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('timeout')), REPORT_TIMEOUT_MS)
            ),
        ]);
        return true;
    } catch (e) {
        console.log('[ownerReport] gagal kirim report ke owner:', e?.message || e);
        return false;
    }
}

/**
 * Report saat bot berhasil online/connect.
 */
async function reportOnline(extra = {}) {
    const key = 'online';
    if (_shouldThrottle(key)) return;
    const lines = [
        '✅ *ALYA V20 — ONLINE*',
        '',
        `🕒 Waktu   : ${_now()}`,
        `📱 Nomor   : ${extra.number || '-'}`,
        `🖥️ PID     : ${process.pid}`,
        `♻️ Restart : otomatis berjalan normal`,
    ];
    await _safeSend(lines.join('\n'));
}

/**
 * Report saat terjadi error fatal (uncaughtException / unhandledRejection).
 * type: 'uncaughtException' | 'unhandledRejection'
 */
async function reportCrash(type, err) {
    const key = `crash:${type}`;
    if (_shouldThrottle(key)) return;
    const message = err?.stack || err?.message || String(err);
    const lines = [
        '🚨 *ALYA V20 — ERROR TERDETEKSI*',
        '',
        `🕒 Waktu  : ${_now()}`,
        `⚠️ Jenis  : ${type}`,
        `📄 Detail :`,
        '```' + _trim(message) + '```',
        '',
        '♻️ PM2 akan auto-restart bot dalam beberapa detik.',
    ];
    await _safeSend(lines.join('\n'));
}

/**
 * Report saat proses menerima sinyal shutdown (SIGTERM/SIGINT dari PM2).
 */
async function reportShutdown(signal) {
    const key = 'shutdown';
    if (_shouldThrottle(key)) return;
    const lines = [
        '🛑 *ALYA V20 — SHUTDOWN*',
        '',
        `🕒 Waktu  : ${_now()}`,
        `📶 Sinyal : ${signal}`,
        `ℹ️ Bot dimatikan / direstart oleh sistem (PM2/Panel).`,
        `♻️ Bot akan menyala kembali otomatis jika ini bukan stop manual.`,
    ];
    await _safeSend(lines.join('\n'));
}

/**
 * Report saat RAM melebihi batas dan bot akan restart sendiri.
 * Dipanggil dari memory watchdog.
 */
async function reportMemoryRestart(usedMB, limitMB) {
    const key = 'memory';
    if (_shouldThrottle(key)) return;
    const lines = [
        '🧠 *ALYA V20 — RESTART (RAM TINGGI)*',
        '',
        `🕒 Waktu       : ${_now()}`,
        `📊 RAM Terpakai: ${usedMB} MB`,
        `🚧 Batas       : ${limitMB} MB`,
        `♻️ Bot restart otomatis untuk membersihkan memori.`,
    ];
    await _safeSend(lines.join('\n'));
}

module.exports = {
    getOwnerJid,
    reportOnline,
    reportCrash,
    reportShutdown,
    reportMemoryRestart,
};
