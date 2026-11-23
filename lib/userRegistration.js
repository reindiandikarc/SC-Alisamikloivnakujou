// lib/userRegistration.js
//
// FIX: .daftar/.automaticreg sebelumnya menyimpan data ke file terpisah
// (database/registered.json) yang dibaca sekali ke variabel module-level
// `let registeredUsers` — DI DUA TEMPAT BERBEDA:
//   - alya.js (dispatcher, mode plugin) baris ~130
//   - Alya.js (mesin mode case) baris ~154-155
// Karena keduanya adalah scope module terpisah, push ke salah satu array
// tidak pernah terlihat oleh yang lain sampai proses di-restart penuh.
// Akibatnya: user yang daftar lewat mode plugin "tidak terdaftar" kalau bot
// lagi di mode case (atau sebaliknya), dan race antar pendaftaran bisa saling
// menimpa file JSON.
//
// Solusi: satu sumber data — global.db.users[id].registered — yang otomatis
// terlihat sama oleh mode case maupun plugin (global object di satu proses
// Node yang sama), dan disimpan lewat saveDB() yang sudah debounced/aman.
'use strict';

/**
 * Cari user terdaftar berdasarkan id (JID pengirim).
 * @returns {object|null} data registrasi user, atau null kalau belum daftar
 */
function findRegisteredUser(db, id) {
  const u = db?.users?.[id];
  if (!u || !u.registered) return null;
  return u.registered;
}

/**
 * Daftarkan user baru. Menulis ke global.db.users[id].registered dan
 * memicu saveDB(). Melempar error kalau user sudah terdaftar (cek dulu
 * dengan findRegisteredUser sebelum memanggil ini).
 */
function registerUser(db, saveDB, id, { nama, kodeReg, daftarPada, ppuser, bonusLimit = 30, bonusMoney = 50000 }) {
  if (!db.users[id]) db.users[id] = {};

  const dataUser = {
    id,
    nama,
    kodeReg,
    daftar_pada: daftarPada,
    status: 'Free',
    verified: true,
    ppuser: ppuser || null,
  };

  db.users[id].registered = dataUser;
  db.users[id].limit = (db.users[id].limit || 0) + bonusLimit;
  db.users[id].money = (db.users[id].money || 0) + bonusMoney;

  saveDB(db);
  return dataUser;
}

/**
 * Hapus registrasi satu user. Tidak menyentuh limit/money yang sudah
 * diberikan (konsisten dengan perilaku lama yang cuma hapus dari daftar).
 */
function unregisterUser(db, saveDB, id) {
  if (!db.users[id] || !db.users[id].registered) return false;
  const deleted = db.users[id].registered;
  delete db.users[id].registered;
  saveDB(db);
  return deleted;
}

/**
 * Hapus semua registrasi.
 */
function unregisterAll(db, saveDB) {
  let count = 0;
  for (const id of Object.keys(db.users || {})) {
    if (db.users[id].registered) {
      delete db.users[id].registered;
      count++;
    }
  }
  if (count > 0) saveDB(db);
  return count;
}

/**
 * Daftar semua user yang terdaftar, format sama seperti array
 * `registeredUsers` lama (untuk kompatibilitas command yang menampilkan
 * list, mis. .deldaftar).
 */
function listRegisteredUsers(db) {
  const out = [];
  for (const id of Object.keys(db.users || {})) {
    if (db.users[id].registered) out.push(db.users[id].registered);
  }
  return out;
}

function generateKodeReg(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'RYU';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = {
  findRegisteredUser,
  registerUser,
  unregisterUser,
  unregisterAll,
  listRegisteredUsers,
  generateKodeReg,
};
