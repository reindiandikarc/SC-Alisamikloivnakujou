// Plugin: stickermenu
// Fixed V10→V19 migration
// Commands: stickermenu

'use strict'

module.exports = {
  command: ['stickermenu'],
  tags: ['sticker'],
  run: async (alya, m, ctx) => {
    const {
      prefix,
      listbut2, listbut3
    } = ctx

    const AlyaSad = `╭──── • 📁 *STICKER MENU* • ────╮
┃
┣⊱ 🦢 *${prefix}goose* - Sticker angsa lucu
┣⊱ 🐶 *${prefix}woof* - Sticker anjing
┣⊱ 🎱 *${prefix}8ball* - Sticker magic 8-ball
┣⊱ 🦎 *${prefix}lizard* - Sticker kadal
┣⊱ 🐱 *${prefix}meow* - Sticker kucing
┣⊱ 🔱 *${prefix}gura* - Sticker Gura VTuber
┣⊱ 🐶 *${prefix}doge* - Sticker doge meme
┣⊱ ⭐ *${prefix}patricksticker* - Sticker Patrick Star
┣⊱ ❤️ *${prefix}lovestick* - Sticker cinta
┃
┣⊱ 🏷️ *${prefix}spank* - Sticker spank
┣⊱ 😄 *${prefix}tickle* - Sticker tickle
┣⊱ 🎭 *${prefix}dogestick* - Sticker doge versi 2
┣⊱ 🎭 *${prefix}gurastick* - Sticker gura versi 2
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`

    const sections = [
      {
        title: '🌟 MENU UTAMA',
        rows: [
          { title: '📦 SEMUA FITUR', description: '📌 Tampilkan semua list perintah bot', id: `${prefix}allmenu` },
          { title: '📜 PERATURAN', description: '🎉 Baca aturan penggunaan bot', id: `${prefix}rules` },
          { title: '🆕 FITUR BARU', description: 'Update fitur terbaru Alya', id: `${prefix}newfitur` },
          { title: '💸 DONASI', description: 'Donasi bot agar dapat berkembang', id: `${prefix}donasi` },
          { title: '🌟 RATING', description: 'Rating bot ini', id: `${prefix}rating` },
          { title: '📋 INFO BOT', description: 'Menampilkan informasi bot', id: `${prefix}infobot` },
          { title: '🔄 UPDATE MENU', description: 'Lihat update terbaru Alya V19', id: `${prefix}updatemenu` }
        ]
      },
      {
        title: '🎮 GAME & RPG',
        rows: [
          { title: '🕹️ GAME MENU', description: 'Kumpulan game seru', id: `${prefix}gamemenu` },
          { title: '🦸 ULTRAMAN GAME', description: 'Hero vs Villain, lawan Kaiju!', id: `${prefix}ultraman` },
          { title: '🧰 RPG MENU', description: 'Dungeon, Mining, & Inventory', id: `${prefix}rpgmenu` },
          { title: '🛍️ STORE MENU', description: 'Menampilkan fitur jabeh/shop', id: `${prefix}storemenu` }
        ]
      },
      {
        title: '🛠️ TOOLS & AI',
        rows: [
          { title: '🤖 AI MENU', description: 'Fitur kecerdasan buatan', id: `${prefix}aimenu` },
          { title: '🎭 SET ROLE AI', description: 'Atur hubunganmu dengan Alya', id: `${prefix}setrole` },
          { title: '📝 STICKER MENU', description: 'Kumpulan fitur pembuat sticker', id: `${prefix}stickermenu` },
          { title: '🔍 STALKER MENU', description: 'Fitur stalking media sosial', id: `${prefix}stalkermenu` },
          { title: '🖥️ DATABASE MENU', description: 'Fitur manajemen database', id: `${prefix}databasemenu` },
          { title: '🔮 PRIMBON MENU', description: 'Fitur ramalan & primbon', id: `${prefix}primbonmenu` },
          { title: '💬 QUOTES MENU', description: 'Kumpulan kata-kata bijak', id: `${prefix}quotesmenu` },
          { title: '📶 CEK KUOTA', description: 'Cek kuota internet semua operator', id: `${prefix}cekkuota` }
        ]
      },
      {
        title: '📂 DOWNLOADER & MEDIA',
        rows: [
          { title: '📂 DOWNLOADER', description: 'Tiktok, YT, IG Downloader', id: `${prefix}downloadmenu` },
          { title: '🎥 RANDOM VIDEO', description: 'Menampilkan fitur random video', id: `${prefix}randomvideomenu` },
          { title: '📷 RANDOM PHOTO', description: 'Menampilkan fitur random foto', id: `${prefix}randomphotomenu` },
          { title: '🔞 NSFW MENU', description: 'Menampilkan fitur 18+', id: `${prefix}nsfwmenu` }
        ]
      },
      {
        title: '🎨 EDIT FOTO & ANIME',
        rows: [
          { title: '🎨 EDIT FOTO', description: 'Ephoto360 & Maker', id: `${prefix}ephoto360menu` },
          { title: '🤍 ANIME MENU', description: 'Kumpulan fitur anime', id: `${prefix}animemenu` }
        ]
      },
      {
        title: '🌐 PANEL & HOSTING',
        rows: [
          { title: '🛠️ CPANEL MENU', description: 'Fitur create panel', id: `${prefix}cpanelmenu` },
          { title: '⚙️ PTERODACTYL', description: 'Fitur manajemen Pterodactyl', id: `${prefix}pyterodactylemenu` },
          { title: '🌊 DIGITAL OCEAN', description: 'Fitur manajemen Digital Ocean', id: `${prefix}digitaloceanmenu` },
          { title: '🌐 DOMAIN MENU', description: 'Fitur create subdomain', id: `${prefix}domainmenu` }
        ]
      },
      {
        title: '🥳 FUN & LAIN-LAIN',
        rows: [
          { title: '🥳 FUN MENU', description: 'Fitur menyenangkan', id: `${prefix}funmenu` },
          { title: '🕌 ISLAMI MENU', description: 'Fitur religi islami', id: `${prefix}islamimenu` },
          { title: '👤 ANONYMOUS', description: 'Fitur anonymous chat', id: `${prefix}anonymousmenu` },
          { title: '📮 BERITA MENU', description: 'Fitur berita terkini', id: `${prefix}beritamenu` },
          { title: '🚆 TRANSPORTASI MENU', description: 'Jadwal kereta & pesawat Indonesia', id: `${prefix}transportasimenu` },
          { title: '💾 PUSH MENU', description: 'Fitur push kontak/broadcast', id: `${prefix}pushmenu` },
          { title: '🐛 BUG MENU', description: 'Fitur bug WhatsApp', id: `${prefix}bugmenu` },
          { title: '📪 OTHER MENU', description: 'Fitur yang tidak dikategorikan', id: `${prefix}othermenu` }
        ]
      },
      {
        title: '👑 OWNER & ADMIN',
        rows: [
          { title: '👤 OWNER MENU', description: 'Khusus untuk pengembang bot', id: `${prefix}ownermenu` },
          { title: '👥 GROUP MENU', description: 'Pengaturan grup & admin', id: `${prefix}groupmenu` }
        ]
      }
    ]

    const listnye = {
      title: 'LIHAT MENU',
      sections: sections
    }

    await listbut3(m.chat, AlyaSad, listnye, m)
  }
}
