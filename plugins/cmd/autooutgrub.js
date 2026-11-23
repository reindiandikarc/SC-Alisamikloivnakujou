// Plugin: autooutgrub
// Commands: autooutgrub
// Fungsi: Toggle fitur auto-keluar dari grup yang belum terdaftar sewa.
//         Saat bot ditambahkan ke grup oleh siapapun, bot mengecek
//         apakah grup tersebut ada di database sewa. Jika TIDAK terdaftar,
//         bot kirim pesan peringatan lalu langsung keluar.
// Handler aktif: lib/autooutgrub.js (dipanggil dari group-participants.update)

'use strict';

const fs   = require('fs');
const path = require('path');

const DB_PATH = path.join('./database', 'autooutgrub.json');

function loadDB() {
  try {
    if (fs.existsSync(DB_PATH)) return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {}
  return { aktif: false };
}

function saveDB(data) {
  try { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); } catch {}
}

module.exports = {
  command: ['autooutgrub'],
  tags   : ['owner'],
  run    : async (alya, m, ctx) => {
    const { command, args, text, prefix, Ryuu, reply, replyalya, replytolak } = ctx;

    if (!Ryuu) return replytolak('❌ Fitur ini khusus *Owner* saja!');

    const db     = loadDB();
    const isAktif = db.aktif === true;

    // ── Tampilkan status jika tidak ada argumen ──
    if (!text) {
      return replyalya(
        `🚪━〔 *AUTO OUT GRUP* 〕━🚪\n\n` +
        `📊 *Status Sistem*\n` +
        `• Auto Out Grub : *${isAktif ? 'AKTIF ✅' : 'NONAKTIF ❌'}*\n\n` +
        `ℹ️ *Cara Kerja*\n` +
        `Jika aktif, bot akan otomatis keluar dari grup yang belum terdaftar sewa. ` +
        `Sebelum keluar, bot mengirim pesan peringatan agar admin grup tahu.\n\n` +
        `📝 *Cara Daftarkan Grup:*\n` +
        `${prefix}addsewa <link_grup> <durasi>\n` +
        `Contoh: ${prefix}addsewa https://chat.whatsapp.com/XXX 30d\n\n` +
        `⚙️ *Pengaturan*\n` +
        `• ${prefix}autooutgrub on  — Aktifkan\n` +
        `• ${prefix}autooutgrub off — Nonaktifkan`
      );
    }

    if (args[0] === 'on') {
      if (isAktif) return replyalya('🚪 Auto Out Grub sudah *AKTIF*.');
      db.aktif = true;
      saveDB(db);
      global.autooutgrub = true;
      return replyalya(
        `✅ *Auto Out Grub DIAKTIFKAN!*\n\n` +
        `Bot akan otomatis keluar dari grup yang belum terdaftar sewa.\n` +
        `Daftarkan grup dengan: *${prefix}addsewa <link> <durasi>*`
      );
    }

    if (args[0] === 'off') {
      if (!isAktif) return replyalya('🚪 Auto Out Grub sudah *NONAKTIF*.');
      db.aktif = false;
      saveDB(db);
      global.autooutgrub = false;
      return replyalya(
        `❌ *Auto Out Grub DINONAKTIFKAN.*\n\n` +
        `Bot sekarang bisa masuk ke grup manapun tanpa cek sewa.`
      );
    }

    replyalya(
      `Gunakan:\n` +
      `• ${prefix}autooutgrub on\n` +
      `• ${prefix}autooutgrub off`
    );
  },
};
