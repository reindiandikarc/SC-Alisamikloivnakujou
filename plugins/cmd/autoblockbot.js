// Plugin: autoblockbot
// Commands: autoblockbot
// Fungsi: Toggle auto-block siapapun yang DM pribadi ke bot (kecuali owner/whitelist).
//
// CATATAN: Eksekusi nyata (kirim warning + block) ada di listener yang
// didaftarkan lewat _anticall-autoblock-core.js (registerListenersOnce).
// Handler AUTOBLOCKBOT versi lama di alya.js sudah DINONAKTIFKAN (dikomentari)
// supaya tidak dobel warning/block.
//
// PERBEDAAN PERILAKU vs versi lama:
// - Lama: hanya aktif saat mode SELF (alya.public === false), mengecualikan
//   owner + prem + alya.
// - Baru: aktif untuk SEMUA DM pribadi selama toggle ON (tidak tergantung
//   mode public/self), mengecualikan owner + whitelist (lihat store
//   database/anticall-autoblock.json -> field "whitelist", isi dengan
//   nomor/JID yang ingin tetap boleh DM, mis. akun premium).
//
// Status disimpan di database/anticall-autoblock.json (store terpisah,
// tidak tergantung db lama) dan disinkronkan juga ke `setting.autoblockbot`,
// `global.autoblockbot`, dan `db` lama supaya panel/fitur lain yang
// membaca field tersebut tetap konsisten.

'use strict';

const { loadStore, saveStore, registerListenersOnce } = require('./_anticall-autoblock-core.js');

module.exports = {
  command: ['autoblockbot'],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const { args, text, prefix, Ryuu, setting, db, saveDB, replyalya, replytolak } = ctx;

    if (!Ryuu) return replytolak('Hanya owner yang bisa mengatur fitur ini! 😤');

    registerListenersOnce(alya);

    const dbRef = db || global.db;
    const store = loadStore();

    if (setting) {
      setting.autoblockbot = store.autoblockbot === true;
      global.autoblockbot = setting.autoblockbot === true;
    }

    const isAktif = store.autoblockbot === true;

    if (!text) {
      return replyalya(
        `🔒━〔 *AUTO BLOCK BOT* 〕━🔒\n\n` +
        `📊 *Status Sistem*\n` +
        `• Auto Block DM : *${isAktif ? 'AKTIF ✅' : 'NONAKTIF ❌'}*\n\n` +
        `ℹ️ *Info*\n` +
        `Jika aktif, siapapun yang DM bot (kecuali owner/whitelist) akan:\n` +
        `1. Mendapat pesan peringatan\n` +
        `2. Nomornya langsung *DIBLOKIR* di WhatsApp\n\n` +
        `⚙️ *Pengaturan*\n` +
        `• \`${prefix}autoblockbot on\`  — Aktifkan\n` +
        `• \`${prefix}autoblockbot off\` — Nonaktifkan`
      );
    }

    if (args[0] === 'on') {
      if (isAktif) return replyalya('🔒 Auto Block Bot sudah aktif.');
      store.autoblockbot = true;
      saveStore(store);
      if (setting) { setting.autoblockbot = true; global.autoblockbot = true; }
      try { saveDB ? saveDB(dbRef) : null; } catch (_) {}
      return replyalya(
        `✅ *Auto Block Bot DIAKTIFKAN!*\n\n` +
        `Siapapun yang DM bot akan langsung:\n` +
        `• Mendapat pesan peringatan\n` +
        `• *Diblokir nomornya* di WhatsApp\n\n` +
        `_Kecuali: owner dan whitelist_`
      );
    }

    if (args[0] === 'off') {
      if (!isAktif) return replyalya('🔓 Auto Block Bot sudah nonaktif.');
      store.autoblockbot = false;
      saveStore(store);
      if (setting) { setting.autoblockbot = false; global.autoblockbot = false; }
      try { saveDB ? saveDB(dbRef) : null; } catch (_) {}
      return replyalya('❌ *Auto Block Bot DINONAKTIFKAN.*\n\nBot sekarang bisa menerima pesan pribadi.');
    }

    replyalya(`Gunakan:\n• \`${prefix}autoblockbot on\`\n• \`${prefix}autoblockbot off\``);
  },
};
