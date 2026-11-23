/**
 * debouncewriter.js — Debounced JSON Writer untuk file-file kecil
 *
 * Masalah:
 *   Banyak fungsi save*() di alya.js memanggil fs.writeFileSync langsung.
 *   Saat bot ramai (banyak pesan/command), ini memblokir event loop Node.js
 *   puluhan hingga ratusan kali per menit → CPU 100% → bot hang.
 *
 * Solusi:
 *   Tunda penulisan ke disk max 1x per DELAY_MS per file.
 *   Jika dipanggil 50x dalam 3 detik → hanya 1x tulis ke disk.
 *   Data tetap aman di memory, ditulis atomic (via safewrite).
 *
 * Cara pakai:
 *   const { debouncedWrite, flushAllDebounced } = require('./lib/debouncewriter');
 *   // Ganti: fs.writeFileSync(path, JSON.stringify(data, null, 2))
 *   // Dengan: debouncedWrite(path, () => data)
 */

const { safeWriteJSON } = require('./safewrite');

// Map: filePath → { timer, getData }
const _pending = new Map();

const DEFAULT_DELAY_MS = 3000; // tulis max 1x per 3 detik per file

/**
 * Jadwalkan penulisan JSON ke disk dengan debounce.
 * Panggilan berulang dalam delayMs akan digabung menjadi 1 penulisan saja.
 *
 * @param {string}   filePath  - path file tujuan
 * @param {Function} getData   - fungsi () => data yang akan ditulis (dipanggil saat benar-benar mau tulis)
 * @param {number}   delayMs   - waktu debounce dalam ms (default 3000)
 */
function debouncedWrite(filePath, getData, delayMs = DEFAULT_DELAY_MS) {
    // Batalkan timer sebelumnya jika ada
    if (_pending.has(filePath)) {
        clearTimeout(_pending.get(filePath).timer);
    }

    const timer = setTimeout(() => {
        _pending.delete(filePath);
        try {
            safeWriteJSON(filePath, getData());
        } catch (e) {
            // Jangan crash bot hanya karena gagal tulis file kecil
            if (process.env.NODE_ENV !== 'production') {
                console.error('[DebouncedWrite] Gagal tulis', filePath, e.message);
            }
        }
    }, delayMs);

    _pending.set(filePath, { timer, getData });
}

/**
 * Paksa flush semua pending writes segera (panggil sebelum process exit).
 * Sync agar bisa dipakai di event 'exit'.
 */
function flushAllDebounced() {
    for (const [filePath, { timer, getData }] of _pending.entries()) {
        clearTimeout(timer);
        try {
            safeWriteJSON(filePath, getData());
        } catch (_) {}
    }
    _pending.clear();
}

// Flush saat process exit
process.on('exit', () => {
    flushAllDebounced();
});

module.exports = { debouncedWrite, flushAllDebounced };
