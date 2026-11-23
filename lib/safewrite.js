/**
 * safewrite.js — Atomic JSON write utility
 * Mencegah korupsi data saat bot di-stop paksa di tengah penulisan file.
 * 
 * Cara kerja:
 *  1. Tulis ke file .tmp dulu
 *  2. Kalau sukses, rename (atomic di level OS) ke file asli
 *  3. Kalau gagal, file asli tidak tersentuh
 */
const fs = require('fs');
const path = require('path');

/**
 * Tulis JSON secara atomic — aman terhadap force-kill
 * @param {string} filePath  - path file tujuan
 * @param {*}      data      - data yang akan di-JSON.stringify
 * @param {number} spaces    - indentasi (default 2)
 */
function safeWriteJSON(filePath, data, spaces = 2) {
    const tmpPath = filePath + '.tmp';
    try {
        const json = JSON.stringify(data, null, spaces);
        fs.writeFileSync(tmpPath, json, 'utf8');
        fs.renameSync(tmpPath, filePath);
    } catch (err) {
        // Hapus .tmp kalau ada sisa
        try { fs.unlinkSync(tmpPath); } catch (_) {}
        throw err;
    }
}

/**
 * Baca JSON dengan fallback ke defaultValue kalau file rusak/tidak ada
 * @param {string} filePath
 * @param {*}      defaultValue
 */
function safeReadJSON(filePath, defaultValue = null) {
    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(raw);
    } catch (_) {
        return defaultValue;
    }
}

/**
 * Wrapper async-safe (tidak memblokir event loop untuk file besar)
 */
async function safeWriteJSONAsync(filePath, data, spaces = 2) {
    const tmpPath = filePath + '.tmp';
    const json = JSON.stringify(data, null, spaces);
    await fs.promises.writeFile(tmpPath, json, 'utf8');
    await fs.promises.rename(tmpPath, filePath);
}

module.exports = { safeWriteJSON, safeReadJSON, safeWriteJSONAsync };
