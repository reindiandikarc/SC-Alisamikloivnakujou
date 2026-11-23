// lib/salamuser.js
// Helper generik untuk fitur .salamuser / .salamowner / .salamadmin on/off
//
// File toggle terpisah per fitur (pola sama seperti openaigc.json):
//   - salamuser.json    : array grup id yang .salamuser on
//   - salamowner.json   : array grup id yang .salamowner on
//   - salamadmin.json   : array grup id yang .salamadmin on
//
// File tracker "kapan terakhir chat" — SATU file, dipisah per kategori
// di dalamnya, supaya diam 1 jam untuk kategori user tidak nyampur
// dengan diam 1 jam untuk kategori owner/admin:
//   salamSeen.json : { "<category>": { "<groupId>": { "<userId>": lastMs } } }
//
// Konsep tiap kategori:
//   Setiap pesan masuk dari orang yang relevan (user terdaftar / owner bot /
//   admin grup) di grup yang togglenya ON, dicek kapan terakhir dia chat di
//   grup itu (khusus kategori itu). Kalau gap >= AMBANG_DIAM_MS (1 jam) atau
//   belum pernah tercatat, bot kirim pesan siaga lalu update jam. Kalau
//   gap masih di bawah ambang, hanya update jam diam-diam (silent).

'use strict';

const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(process.cwd(), 'database');
const SEEN_DB = path.join(DB_DIR, 'salamSeen.json');

const TOGGLE_FILES = {
  user: path.join(DB_DIR, 'salamuser.json'),
  owner: path.join(DB_DIR, 'salamowner.json'),
  admin: path.join(DB_DIR, 'salamadmin.json'),
};

// Ambang waktu "dianggap lama tidak chat" → 1 jam (sama untuk ketiga fitur)
const AMBANG_DIAM_MS = 60 * 60 * 1000;

// ─── Toggle list (grup mana yang mengaktifkan fitur) ────────────────────────

function loadToggle(category) {
  const file = TOGGLE_FILES[category];
  if (!file) return [];
  try {
    if (!fs.existsSync(file)) { fs.writeFileSync(file, '[]'); return []; }
    return JSON.parse(fs.readFileSync(file, 'utf-8')) || [];
  } catch { return []; }
}

function saveToggle(category, arr) {
  const file = TOGGLE_FILES[category];
  if (!file) return;
  try { fs.writeFileSync(file, JSON.stringify(arr, null, 2)); } catch (e) {
    console.error(`[salam:${category}] gagal simpan toggle:`, e.message);
  }
}

// Nama variabel global tempat masing-masing kategori disimpan (array grup),
// supaya toggle on/off langsung efektif tanpa restart bot.
const GLOBAL_KEY = {
  user: 'salamuser',
  owner: 'salamowner',
  admin: 'salamadmin',
};

function getGlobalArr(category) {
  const key = GLOBAL_KEY[category];
  if (!key) return [];
  if (!Array.isArray(global[key])) global[key] = loadToggle(category);
  return global[key];
}

// ─── Seen tracker (kapan terakhir chat, per kategori) ───────────────────────

function loadSeen() {
  try {
    if (!fs.existsSync(SEEN_DB)) { fs.writeFileSync(SEEN_DB, '{}'); return {}; }
    return JSON.parse(fs.readFileSync(SEEN_DB, 'utf-8')) || {};
  } catch { return {}; }
}

// ✅ Debounced write agar tidak readFileSync/writeFileSync tiap pesan
let _seenCache = null;
let _seenDirty = false;
let _seenTimer = null;

function _getSeenCache() {
  if (!_seenCache) _seenCache = loadSeen();
  return _seenCache;
}

function _flushSeen() {
  if (!_seenDirty) return;
  try {
    fs.writeFileSync(SEEN_DB, JSON.stringify(_seenCache, null, 2));
    _seenDirty = false;
  } catch (e) {
    console.error('[salam] gagal simpan seen:', e.message);
  }
}

function _scheduleFlush() {
  _seenDirty = true;
  if (_seenTimer) return;
  _seenTimer = setTimeout(() => {
    _seenTimer = null;
    _flushSeen();
  }, 5000); // debounce 5 detik
}

/**
 * checkAndMarkSalam
 * Dipanggil tiap pesan masuk relevan. Return true kalau bot HARUS
 * mengirim pesan siaga sekarang (diam lama, baru muncul lagi).
 *
 * @param {string} category - 'user' | 'owner' | 'admin'
 * @param {string} groupId  - m.chat (JID grup)
 * @param {string} userId   - m.sender (JID pengirim)
 * @returns {boolean}
 */
function checkAndMarkSalam(category, groupId, userId) {
  const now = Date.now();
  const seen = _getSeenCache();

  if (!seen[category]) seen[category] = {};
  if (!seen[category][groupId]) seen[category][groupId] = {};
  const lastTime = seen[category][groupId][userId] || 0;

  const isLongAbsence = lastTime === 0 || (now - lastTime) >= AMBANG_DIAM_MS;

  seen[category][groupId][userId] = now;
  _scheduleFlush();

  return isLongAbsence;
}

/** Cek apakah grup ini mengaktifkan fitur kategori tertentu */
function isSalamActive(category, groupId) {
  return getGlobalArr(category).includes(groupId);
}

module.exports = {
  loadToggle,
  saveToggle,
  getGlobalArr,
  isSalamActive,
  checkAndMarkSalam,
  AMBANG_DIAM_MS,
  GLOBAL_KEY,
};
