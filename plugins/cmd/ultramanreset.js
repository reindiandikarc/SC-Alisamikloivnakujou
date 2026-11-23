// Plugin: ultramanreset
// Commands: ultramanreset
// Fix V13: self-contained — tidak bergantung fungsi di alya.js scope
// Cukup akses database ultraman.json langsung

'use strict';

const fs   = require('fs');
const path = require('path');

const ULTRAMAN_DB_PATH = path.join(process.cwd(), 'database', 'ultraman.json');

function loadUltramanDB() {
  try {
    if (!fs.existsSync(ULTRAMAN_DB_PATH)) fs.writeFileSync(ULTRAMAN_DB_PATH, '{}');
    return JSON.parse(fs.readFileSync(ULTRAMAN_DB_PATH, 'utf-8'));
  } catch { return {}; }
}

function saveUltramanDB(data) {
  try { fs.writeFileSync(ULTRAMAN_DB_PATH, JSON.stringify(data, null, 2)); }
  catch (e) { console.error('[ultramanreset] Gagal simpan DB:', e.message); }
}

module.exports = {
  command: ['ultramanreset'],
  tags   : ['game'],
  run    : async (alya, m, ctx) => {
    const { prefix, replyalya } = ctx;

    const db  = loadUltramanDB();
    const key = m.sender;

    // Belum punya data Ultraman
    if (!db[key]) {
      return replyalya(
        `❌ *Kamu belum punya data Ultraman!*\n\n` +
        `Mulai dulu dengan:\n` +
        `• *${prefix}hero* — Jadi Ultraman cahaya ✨\n` +
        `• *${prefix}villain* — Jadi Dark Ultra 😈`
      );
    }

    const uData   = db[key];
    const oldForm = uData.form || 'Unknown';

    // Hapus data
    delete db[key];
    saveUltramanDB(db);

    return replyalya(
      `✅ *Data Ultraman Direset!*\n\n` +
      `🗑️ Form *${oldForm}* telah dihapus.\n\n` +
      `Kamu bisa mulai petualangan baru:\n` +
      `• *${prefix}hero* — Jadi Ultraman cahaya ✨\n` +
      `• *${prefix}villain* — Jadi Dark Ultra 😈`
    );
  },
};
