// lib/integrity.js — DINONAKTIFKAN untuk porting ke Alya.
// Versi vanXone memanggil process.exit(1) bila hash lib/autojoin.js tidak cocok.
// lib/autojoin.js sengaja tidak disalin (auto join saluran/grup vanXone tidak diinginkan),
// jadi penjaga ini dibuat no-op agar bot Alya tetap hidup.
'use strict'
function check() { return true }
module.exports = { check }
