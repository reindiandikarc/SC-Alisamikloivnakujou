// lib/prefix.js
// Helper baca/tulis daftar prefix bot dari database/setting.json.
// Mendukung multi-prefix (array), backward-compatible dengan format lama
// yang cuma simpan string tunggal ("prefix": ".").
//
// Dipakai oleh:
//   - alya.js (deteksi prefix di awal pesan, command parsing)
//   - plugins/cmd/setprefix.js (command owner untuk ubah prefix)
//   - listbut2/listbut3 (info "Prefix saat ini" di footer menu)

'use strict';

const fs = require('fs');
const path = require('path');

const SETTING_DB = path.join(process.cwd(), 'database', 'setting.json');

// Daftar default kalau file belum ada / corrupt / kosong.
const DEFAULT_PREFIXES = ['.', '/', '!'];

// ─── Baca raw file setting.json ────────────────────────────────────────────
function readSettingFile() {
  try {
    if (!fs.existsSync(SETTING_DB)) return {};
    const raw = fs.readFileSync(SETTING_DB, 'utf-8');
    if (!raw || !raw.trim()) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// ─── Tulis raw object ke setting.json ──────────────────────────────────────
function writeSettingFile(obj) {
  const dir = path.dirname(SETTING_DB);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SETTING_DB, JSON.stringify(obj, null, 2), 'utf-8');
}

// ─── Normalisasi nilai "prefix" dari setting.json jadi array unik ─────────
// Support:
//   - string tunggal:      "."           → ["."]
//   - array:                [".", "!"]   → [".", "!"]
//   - kosong/invalid:                    → DEFAULT_PREFIXES
function normalizePrefixes(raw) {
  let arr;
  if (Array.isArray(raw)) {
    arr = raw;
  } else if (typeof raw === 'string' && raw.length > 0) {
    arr = [raw];
  } else {
    arr = DEFAULT_PREFIXES;
  }
  // Bersihkan: hanya string non-kosong, unik, trim
  const cleaned = [...new Set(
    arr
      .filter((p) => typeof p === 'string' && p.trim().length > 0)
      .map((p) => p.trim())
  )];
  return cleaned.length > 0 ? cleaned : DEFAULT_PREFIXES;
}

// ─── getPrefixes(): ambil array prefix aktif (selalu fresh dari file) ─────
// Dipanggil tiap pesan masuk supaya perubahan via .setprefix langsung efektif
// tanpa perlu restart bot.
function getPrefixes() {
  const setting = readSettingFile();
  const prefixes = normalizePrefixes(setting.prefix);
  // Sinkronkan global cache supaya kode lain (mis. listbut2/listbut3) bisa
  // baca cepat tanpa fs.readFileSync berulang kali dalam 1 siklus pesan.
  global.botPrefixes = prefixes;
  return prefixes;
}

// ─── getPrefixDisplay(): string siap-pakai untuk ditampilkan di menu ──────
// Contoh hasil: ". / ! "  →  dipakai di footer/body menu.
function getPrefixDisplay() {
  const prefixes = getPrefixes();
  return prefixes.join(' ');
}

// ─── setPrefixes(list): timpa daftar prefix dengan array baru ────────────
// list boleh array of string, atau satu string. Validasi minimal: tidak
// boleh kosong, tidak boleh ada spasi di dalam satu prefix (prefix harus
// karakter/simbol pendek, bukan kata).
function setPrefixes(list) {
  const incoming = Array.isArray(list) ? list : [list];
  const cleaned = [...new Set(
    incoming
      .filter((p) => typeof p === 'string' && p.trim().length > 0 && !/\s/.test(p.trim()))
      .map((p) => p.trim())
  )];

  if (cleaned.length === 0) {
    return { ok: false, reason: 'EMPTY' };
  }

  const setting = readSettingFile();
  setting.prefix = cleaned;
  writeSettingFile(setting);
  global.botPrefixes = cleaned;

  return { ok: true, prefixes: cleaned };
}

// ─── addPrefix(p): tambah satu prefix baru ke daftar yang sudah ada ──────
function addPrefix(p) {
  if (typeof p !== 'string' || !p.trim() || /\s/.test(p.trim())) {
    return { ok: false, reason: 'INVALID' };
  }
  const current = getPrefixes();
  if (current.includes(p.trim())) {
    return { ok: false, reason: 'EXISTS', prefixes: current };
  }
  const updated = [...current, p.trim()];
  return setPrefixes(updated);
}

// ─── removePrefix(p): hapus satu prefix dari daftar ──────────────────────
// Tidak boleh menghapus sampai daftar kosong — minimal 1 prefix harus tetap ada.
function removePrefix(p) {
  const current = getPrefixes();
  if (!current.includes(p)) {
    return { ok: false, reason: 'NOT_FOUND', prefixes: current };
  }
  const updated = current.filter((x) => x !== p);
  if (updated.length === 0) {
    return { ok: false, reason: 'LAST_PREFIX', prefixes: current };
  }
  return setPrefixes(updated);
}

// ─── matchPrefix(body): cari prefix yang cocok di awal teks pesan ────────
// Return prefix string yang match (prefix terpanjang yang cocok duluan,
// supaya prefix multi-karakter tidak ke-shadow oleh prefix 1 karakter),
// atau null kalau tidak ada yang cocok.
function matchPrefix(body) {
  if (typeof body !== 'string' || body.length === 0) return null;
  const prefixes = getPrefixes();
  // Urutkan dari yang paling panjang dulu supaya match paling spesifik menang
  const sorted = [...prefixes].sort((a, b) => b.length - a.length);
  for (const p of sorted) {
    if (body.startsWith(p)) return p;
  }
  return null;
}

module.exports = {
  DEFAULT_PREFIXES,
  getPrefixes,
  getPrefixDisplay,
  setPrefixes,
  addPrefix,
  removePrefix,
  matchPrefix,
};
