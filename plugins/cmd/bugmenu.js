// Plugin: bugmenu
// Commands: bugmenu
// Diambil dari Alya V10 — menu list bug war V10

'use strict';

module.exports = {
  command: ['bugmenu'],
  tags: ['bug'],
  run: async (alya, m, ctx) => {
    const {
      prefix,
      listbut2,
    } = ctx;

    // Teks menu sama persis dari V10 global.bugmenu()
    const AlyaSad =
`╭── • 💣 *BUG WAR* • ──╮
┃
┣⊱ 💣 *${prefix}forcealya*
┣⊱ 💣 *${prefix}alyacrash*
┣⊱ 💣 *${prefix}alyadozer*
┣⊱ 💣 *${prefix}alyafreez*
┃
╰━━━━━━━━━━━━━━━━━━╯`;

    const sections = [
      {
        title: '🌟 MENU UTAMA',
        rows: [
          { title: '📦 SEMUA FITUR',  description: '📌 Tampilkan semua list perintah bot', id: `${prefix}allmenu` },
          { title: '📜 PERATURAN',    description: '🎉 Baca aturan penggunaan bot',        id: `${prefix}rules` },
          { title: '🆕 FITUR BARU',  description: 'Update fitur terbaru Alya',            id: `${prefix}newfitur` },
          { title: '💸 DONASI',       description: 'Donasi bot agar dapat berkembang',     id: `${prefix}donasi` },
          { title: '🌟 RATING',       description: 'Rating bot ini',                       id: `${prefix}rating` },
          { title: '📋 INFO BOT',     description: 'Menampilkan informasi bot',            id: `${prefix}infobot` },
        ],
      },
      {
        title: '🎮 GAME & RPG',
        rows: [
          { title: '🕹️ GAME MENU',  description: 'Kumpulan game seru',              id: `${prefix}gamemenu` },
          { title: '🧰 RPG MENU',    description: 'Dungeon, Mining, & Inventory',    id: `${prefix}rpgmenu` },
          { title: '🛍️ STORE MENU', description: 'Menampilkan fitur jabeh/shop',   id: `${prefix}storemenu` },
        ],
      },
      {
        title: '🛠️ TOOLS & AI',
        rows: [
          { title: '🤖 AI MENU',       description: 'Fitur kecerdasan buatan',          id: `${prefix}aimenu` },
          { title: '📝 STICKER MENU',  description: 'Kumpulan fitur pembuat sticker',   id: `${prefix}stickermenu` },
          { title: '🔍 STALKER MENU',  description: 'Fitur stalking media sosial',      id: `${prefix}stalkermenu` },
          { title: '🖥️ DATABASE MENU', description: 'Fitur manajemen database',        id: `${prefix}databasemenu` },
          { title: '🔮 PRIMBON MENU',  description: 'Fitur ramalan & primbon',          id: `${prefix}primbonmenu` },
          { title: '💬 QUOTES MENU',   description: 'Kumpulan kata-kata bijak',         id: `${prefix}quotesmenu` },
        ],
      },
      {
        title: '📂 DOWNLOADER & MEDIA',
        rows: [
          { title: '📂 DOWNLOADER',     description: 'Tiktok, YT, IG Downloader',    id: `${prefix}downloadmenu` },
          { title: '🎥 RANDOM VIDEO',   description: 'Menampilkan fitur random video', id: `${prefix}randomvideomenu` },
          { title: '📷 RANDOM PHOTO',   description: 'Menampilkan fitur random foto',  id: `${prefix}randomphotomenu` },
          { title: '🔞 NSFW MENU',      description: 'Menampilkan fitur 18+',         id: `${prefix}nsfwmenu` },
        ],
      },
      {
        title: '🎨 EDIT FOTO & ANIME',
        rows: [
          { title: '🎨 EDIT FOTO',  description: 'Ephoto360 & Maker',          id: `${prefix}ephoto360menu` },
          { title: '🤍 ANIME MENU', description: 'Kumpulan fitur anime',        id: `${prefix}animemenu` },
        ],
      },
      {
        title: '🥳 FUN & LAIN-LAIN',
        rows: [
          { title: '🥳 FUN MENU',        description: 'Fitur menyenangkan',            id: `${prefix}funmenu` },
          { title: '🕌 ISLAMI MENU',     description: 'Fitur religi islami',           id: `${prefix}islamimenu` },
          { title: '📮 BERITA MENU',     description: 'Fitur berita terkini',          id: `${prefix}beritamenu` },
          { title: '🐛 BUG MENU',        description: 'Fitur bug WhatsApp',            id: `${prefix}bugmenu` },
          { title: '📪 OTHER MENU',      description: 'Fitur yang tidak dikategorikan', id: `${prefix}othermenu` },
        ],
      },
      {
        title: '👑 OWNER & ADMIN',
        rows: [
          { title: '👤 OWNER MENU', description: 'Khusus untuk pengembang bot', id: `${prefix}ownermenu` },
          { title: '👥 GROUP MENU', description: 'Pengaturan grup & admin',     id: `${prefix}groupmenu` },
        ],
      },
    ];

    const listnye = {
      title: 'LIHAT MENU',
      sections,
    };

    await listbut3(m.chat, AlyaSad, listnye, m);
  },
};
