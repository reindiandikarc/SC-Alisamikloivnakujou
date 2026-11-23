// Plugin: menfessmenu
// Commands: menfessmenu
// Alya V13 — Menu Menfess dengan listbut2
'use strict';

module.exports = {
  command: ['menfessmenu'],
  tags: ['menfess'],
  run: async (alya, m, ctx) => {
    const {
      prefix, pushname, reply, replyalya, listbut2, listbut3
    } = ctx;

    const teks =
      `╭━━━「 💌 *MENFESS MENU* 」━━━╮\n` +
      `┃\n` +
      `┃ 💌 Kirim perasaan secara ANONIM!\n` +
      `┃ Identitasmu dijaga 100% rahasia 🔒\n┃\n` +
      `┃ 📌 *Cara Kerja:*\n` +
      `┃ 1️⃣ Kamu kirim menfess ke nomor target\n` +
      `┃ 2️⃣ Target terima notif & bisa terima/tolak\n` +
      `┃ 3️⃣ Jika diterima → chat anonim aktif! 💬\n┃\n` +
      `┃ 🔒 Identitas TIDAK akan terungkap\n` +
      `┃    kecuali kamu sendiri yang bilang\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━━╯`;

    const sections = [
      {
        title: '💌 KIRIM MENFESS',
        rows: [
          {
            title: '📤 Kirim Menfess',
            description: 'Kirim perasaan anonim ke seseorang',
            id: `${prefix}sendmenfess`
          }
        ]
      },
      {
        title: '📬 RESPONS MENFESS',
        rows: [
          {
            title: '💚 Terima Menfess',
            description: 'Terima menfess & mulai chat anonim',
            id: `${prefix}terimamenfess`
          },
          {
            title: '🚫 Tolak Menfess',
            description: 'Tolak menfess yang masuk',
            id: `${prefix}tolakmenfess`
          }
        ]
      },
      {
        title: '💬 SAAT SESI AKTIF',
        rows: [
          {
            title: '💬 Balas Menfess',
            description: 'Balas pesan ke pasangan anonim',
            id: `${prefix}balasmenfess`
          },
          {
            title: '🔚 Stop Menfess',
            description: 'Akhiri sesi chat anonim',
            id: `${prefix}stopmenfess`
          }
        ]
      },
      {
        title: '🌟 MENU LAINNYA',
        rows: [
          { title: '📦 Semua Fitur', description: 'Lihat semua command bot', id: `${prefix}allmenu` },
          { title: '🏠 Menu Utama', description: 'Kembali ke menu utama', id: `${prefix}menu` }
        ]
      }
    ];

    const listnye = {
      title: 'PILIH MENU MENFESS',
      sections
    };

    if (typeof listbut2 === 'function') {
      await listbut3(m.chat, teks, listnye, m);
    } else {
      await reply(
        teks + `\n\n` +
        `📌 *Daftar Command:*\n` +
        `• *${prefix}sendmenfess* <pesan>|<nomor>\n` +
        `• *${prefix}terimamenfess* <ID>\n` +
        `• *${prefix}tolakmenfess* <ID>\n` +
        `• *${prefix}balasmenfess* <pesan>\n` +
        `• *${prefix}stopmenfess*`
      );
    }
  }
};
