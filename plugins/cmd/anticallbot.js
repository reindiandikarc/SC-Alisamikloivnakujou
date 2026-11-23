// Plugin: anticallbot
// Commands: anticallbot
// Fungsi: Toggle auto-reject + auto-block siapapun yang menelepon nomor bot.
//
// CATATAN: Eksekusi nyata (reject call + block) ada di listener yang
// didaftarkan lewat _anticall-autoblock-core.js (registerListenersOnce).
// Handler 'call' versi lama di index.js sudah DINONAKTIFKAN (dikomentari)
// supaya tidak dobel reject/block.
//
// Status disimpan di database/anticall-autoblock.json (store terpisah,
// tidak tergantung db lama) dan disinkronkan juga ke `setting.anticall`
// dan `db` lama supaya panel/fitur lain yang membaca setting.anticall
// tetap konsisten.

'use strict';

const { loadStore, saveStore, registerListenersOnce } = require('./_anticall-autoblock-core.js');

module.exports = {
  command: ['anticallbot'],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const { args, text, prefix, Ryuu, setting, db, saveDB, replyalya, replytolak } = ctx;

    if (!Ryuu) return replytolak('Hanya owner yang bisa mengatur fitur ini! 😤');

    registerListenersOnce(alya);

    const dbRef = db || global.db;
    const store = loadStore();

    // Sinkronkan dengan `setting` lama juga (kalau ada) supaya konsisten
    // dengan cara versi lama menyimpan status, tapi sumber kebenaran
    // eksekusi listener tetap file JSON store di atas.
    if (setting) setting.anticall = store.anticall === true;

    const isAktif = store.anticall === true;

    if (!text) {
      return replyalya(`📵━〔 *ANTI CALL BOT* 〕━📵

📊 *Status Sistem*
• Proteksi Panggilan : *${isAktif ? 'AKTIF ✅' : 'NONAKTIF ❌'}*

ℹ️ *Info*
Jika aktif, siapapun yang menelepon nomor bot akan secara otomatis ditolak panggilannya dan diblokir.

⚙️ *Pengaturan*
• ${prefix}anticallbot on  — Aktifkan
• ${prefix}anticallbot off — Nonaktifkan`);
    }

    if (args[0] === 'on') {
      if (isAktif) return replyalya('📵 Anti Call Bot sudah aktif.');
      store.anticall = true;
      saveStore(store);
      if (setting) setting.anticall = true;
      try { saveDB ? saveDB(dbRef) : null; } catch (_) {}
      return replyalya('✅ *Anti Call Bot diaktifkan!*\n\nSiapapun yang menelepon bot akan langsung ditolak dan diblokir.\n\n_Kecuali owner._');
    }

    if (args[0] === 'off') {
      if (!isAktif) return replyalya('📵 Anti Call Bot sudah nonaktif.');
      store.anticall = false;
      saveStore(store);
      if (setting) setting.anticall = false;
      try { saveDB ? saveDB(dbRef) : null; } catch (_) {}
      return replyalya('❌ *Anti Call Bot dinonaktifkan.*\n\nBot sekarang bisa menerima panggilan.');
    }

    replyalya(`Gunakan:\n• ${prefix}anticallbot on\n• ${prefix}anticallbot off`);
  },
};
