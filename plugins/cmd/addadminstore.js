// ╔══════════════════════════════════════════════════════════════╗
// ║        ADMINSTORE MANAGEMENT - Alya V13                     ║
// ║           by reindiandikarc                                  ║
// ╚══════════════════════════════════════════════════════════════╝
// Commands: addadminstore, deladminstore, listadminstore, cekadminstore
// Mapping: grupJid → adminJid (per-grup terpisah)

'use strict';

const path = require('path');
const fs   = require('fs');

const ADMIN_FILE = path.join(__dirname, '../../database/adminstore.json');

function readJSON(file, def = {}) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return def; }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = [
  // ──────────────────────────────────────────────────────────────
  // .addadminstore <nomor>
  // Set admin store untuk grup ini (hanya owner/admin grup)
  // ──────────────────────────────────────────────────────────────
  {
    command: ['addadminstore'],
    tags: ['adminstore'],
    run: async (alya, m, ctx) => {
      const {
        sender, from, text, q, prefix,
        isGroup, Ryuu, isGroupAdmins, isBotAdmins,
        groupName,
        reply, replyalya, replytolak,
        mess
      } = ctx;

      if (!isGroup) return replytolak('Command ini hanya bisa dipakai di dalam grup!');
      if (!Ryuu && !isGroupAdmins) return replytolak('Hanya owner bot atau admin grup yang bisa mengatur adminstore!');

      let input = (text || q || '').trim().replace(/[^0-9]/g, '');
      if (!input) {
        return reply(
          `Penggunaan: *${prefix}addadminstore <nomor>*\n` +
          `Contoh: *${prefix}addadminstore 6281234567890*\n\n` +
          `_Nomor ini akan menjadi admin store untuk grup *${groupName}*_`
        );
      }

      // Normalisasi nomor
      if (input.startsWith('0')) input = '62' + input.slice(1);
      const adminJid = input + '@s.whatsapp.net';

      // Validasi nomor terdaftar di WA
      let valid = false;
      try {
        const cek = await alya.onWhatsApp(adminJid);
        valid = !!(cek && cek.length > 0);
      } catch (_) { valid = true; } // jika cek gagal, lanjut saja

      if (!valid) return replyalya(`Nomor *${input}* tidak ditemukan di WhatsApp!`);

      const adminStore = readJSON(ADMIN_FILE);
      const oldAdmin   = adminStore[from];

      adminStore[from] = adminJid;
      writeJSON(ADMIN_FILE, adminStore);

      let pesan =
        `✅ *Admin Store berhasil diset!*\n\n` +
        `🏠 *Grup      :* ${groupName}\n` +
        `👤 *Admin Baru :* ${input}\n`;
      if (oldAdmin) pesan += `♻️ *Admin Lama :* ${oldAdmin.split('@')[0]}\n`;
      pesan += `\n_Nomor ini akan menerima notifikasi pesanan dari grup ini._`;

      await replyalya(pesan);

      // Kirim notif ke admin baru
      try {
        await alya.sendMessage(adminJid, {
          text:
            `🔔 *Kamu ditunjuk sebagai Admin Store!*\n\n` +
            `🏠 *Grup  :* ${groupName}\n\n` +
            `Kamu akan menerima notifikasi bukti transfer dari grup ini.\n\n` +
            `Perintah yang bisa kamu pakai:\n` +
            `✅ *.doneorder <ID>*  → setujui pesanan\n` +
            `❌ *.rejectorder <ID>* → tolak pesanan`,
        });
      } catch (_) {}
    }
  },

  // ──────────────────────────────────────────────────────────────
  // .deladminstore
  // Hapus admin store untuk grup ini
  // ──────────────────────────────────────────────────────────────
  {
    command: ['deladminstore'],
    tags: ['adminstore'],
    run: async (alya, m, ctx) => {
      const {
        from, isGroup, Ryuu, isGroupAdmins, groupName,
        reply, replyalya, replytolak,
      } = ctx;

      if (!isGroup) return replytolak('Command ini hanya bisa dipakai di dalam grup!');
      if (!Ryuu && !isGroupAdmins) return replytolak('Hanya owner bot atau admin grup!');

      const adminStore = readJSON(ADMIN_FILE);
      if (!adminStore[from]) return reply(`Grup *${groupName}* belum punya admin store.`);

      const old = adminStore[from];
      delete adminStore[from];
      writeJSON(ADMIN_FILE, adminStore);

      await replyalya(
        `🗑️ *Admin Store dihapus!*\n\n` +
        `🏠 *Grup  :* ${groupName}\n` +
        `👤 *Admin :* ${old.split('@')[0]}\n\n` +
        `_Pesanan baru akan diteruskan ke owner bot sebagai fallback._`
      );
    }
  },

  // ──────────────────────────────────────────────────────────────
  // .cekadminstore
  // Lihat siapa admin store di grup ini
  // ──────────────────────────────────────────────────────────────
  {
    command: ['cekadminstore'],
    tags: ['adminstore'],
    run: async (alya, m, ctx) => {
      const {
        from, isGroup, groupName,
        reply, replyalya, replytolak,
      } = ctx;

      if (!isGroup) return replytolak('Command ini hanya bisa dipakai di dalam grup!');

      const adminStore = readJSON(ADMIN_FILE);
      const adminJid   = adminStore[from];

      if (!adminJid) {
        return replyalya(
          `ℹ️ Grup *${groupName}* belum punya admin store.\n\n` +
          `Admin grup bisa set dengan: *.addadminstore <nomor>*`
        );
      }

      await replyalya(
        `👤 *Admin Store Grup Ini*\n\n` +
        `🏠 *Grup  :* ${groupName}\n` +
        `📞 *Admin :* ${adminJid.split('@')[0]}\n\n` +
        `_Notifikasi pesanan akan dikirim ke nomor ini._`
      );
    }
  },

  // ──────────────────────────────────────────────────────────────
  // .listadminstore  (owner only)
  // Lihat semua mapping grup → adminstore
  // ──────────────────────────────────────────────────────────────
  {
    command: ['listadminstore'],
    tags: ['adminstore'],
    run: async (alya, m, ctx) => {
      const {
        Ryuu,
        reply, replytolak,
      } = ctx;

      if (!Ryuu) return replytolak('Hanya owner bot yang bisa melihat semua adminstore!');

      const adminStore = readJSON(ADMIN_FILE);
      const entries    = Object.entries(adminStore);

      if (entries.length === 0) return reply('📭 Belum ada adminstore yang terdaftar.');

      let teks = `*📋 DAFTAR ADMINSTORE*\n\n`;
      let i = 1;
      for (const [grupJid, adminJid] of entries) {
        let namaGrup = grupJid;
        try {
          const meta = await alya.groupMetadata(grupJid);
          namaGrup   = meta.subject || grupJid;
        } catch (_) {}
        teks += `*${i}.* 🏠 ${namaGrup}\n    👤 ${adminJid.split('@')[0]}\n\n`;
        i++;
      }

      await reply(teks.trim());
    }
  },
];
