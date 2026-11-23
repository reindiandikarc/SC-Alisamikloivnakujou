// Plugin: gamemenu
// V10→V19 migrated & merged
// Commands: gamemenu

'use strict'

module.exports = {
  command: ['gamemenu'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const {
      prefix, from,
      reply, replyalya,
      listbut2, listbut3
    } = ctx

    const AlyaSad = `╔════════ • 🎮 *GAME MENU* • ════════╗
┃
┣⊱ 🎯 *TEBAK-TEBAKAN*
┣⊱ 🎮 *${prefix}tebakanml* - Tebak hero Mobile Legends
┣⊱ 🎮 *${prefix}tebakgame* - Tebak judul game
┣⊱ 🏷️ *${prefix}tebaklogo* - Tebak logo brand
┣⊱ 📖 *${prefix}tebaksurah* - Tebak surah Al-Quran
┣⊱ 📝 *${prefix}tebakkata* - Tebak kata acak
┣⊱ ❓ *${prefix}tebaktebakan* - Tebak-tebakan seru
┣⊱ 🎶 *${prefix}tebaklirik* - Tebak lirik lagu
┣⊱ 🖼️ *${prefix}tebakgambar* - Tebak dari gambar
┣⊱ 🎵 *${prefix}tebaklagu* - Tebak judul lagu
┣⊱ 🧪 *${prefix}tebakkimia* - Tebak unsur kimia
┣⊱ 🏳️ *${prefix}tebakbendera* - Tebak bendera negara
┣⊱ 🗺️ *${prefix}tebakkabupaten* - Tebak nama kabupaten
┣⊱ 🈵 *${prefix}tebakhiragana* - Tebak huruf hiragana
┣⊱ 🈵 *${prefix}tebakkatakana* - Tebak huruf katakana
┣⊱ 🈵 *${prefix}tebakkanji* - Tebak huruf kanji
┣⊱ 📝 *${prefix}tebakkalimat* - Tebak kalimat
┣⊱ 🐾 *${prefix}tebakhewan* - Tebak nama hewan
┣⊱ 🎬 *${prefix}tebakfilm* - Tebak judul film
┣⊱ 🇰🇷 *${prefix}tebakdrakor* - Tebak drama Korea (gambar)
┣⊱ 🎮 *${prefix}tebakepep* - Tebak karakter Free Fire (gambar)
┣⊱ 🎀 *${prefix}tebakjkt48* - Tebak member JKT48 (gambar)
┣⊱ 🍜 *${prefix}tebakmakanan* - Tebak nama makanan
┣⊱ 🌍 *${prefix}tebaknegara* - Tebak nama negara
┣⊱ 👔 *${prefix}tebakprofesi* - Tebak nama profesi
┃
┣⊱ 🃏 *KARTU & KASINO*
┣⊱ 🃏 *${prefix}blackjack <taruhan>* - Main BlackJack
┣⊱ 🎰 *${prefix}slot <taruhan>* - Mesin slot
┣⊱ 🎰 *${prefix}slot1 <taruhan>* - Mesin slot v2
┣⊱ 📈 *${prefix}hilo* - Hi-Lo kartu
┣⊱ 🎲 *${prefix}roulette* - Roulette casino
┣⊱ 🎯 *${prefix}casino* - Main casino
┣⊱ 🎪 *${prefix}poker3* - Poker 3 kartu
┃
┣⊱ 🧠 *GAME OTAK*
┣⊱ 🧠 *${prefix}asahotak* - Asah otak
┣⊱ 👤 *${prefix}siapaaku* - Siapa Aku?
┣⊱ 🧩 *${prefix}susunkata* - Susun kata acak
┣⊱ ❓ *${prefix}tekateki* - Teka-teki lucu
┣⊱ 🤡 *${prefix}caklontong* - Cak Lontong jokes
┣⊱ 👨‍👩‍👧‍👦 *${prefix}family100* - Family 100
┣⊱ ⭕ *${prefix}tictactoe* - Tic Tac Toe
┃
┣⊱ ⚔️ *ACTION & RPG*
┣⊱ 🏍️ *${prefix}balapan open <taruhan>* - Balapan liar
┣⊱ 🗡️ *${prefix}begal money* - Begal money target
┣⊱ 🗡️ *${prefix}begal limit* - Begal limit target
┣⊱ ⚔️ *${prefix}fighting* - Tarung dengan member
┣⊱ 🦅 *${prefix}fightphonix* - Lawan pet Phonix
┣⊱ 🦚 *${prefix}fightgriffin* - Lawan pet Griffin
┣⊱ 🐱 *${prefix}fightkucing* - Lawan pet Kucing
┣⊱ 🦊 *${prefix}fightkyubi* - Lawan pet Kyubi
┣⊱ 🗺️ *${prefix}petualang* - Petualangan RPG
┣⊱ 💰 *${prefix}merampok2* - Rampok bank
┃
┣⊱ 💑 *HUSBU & WAIFU*
┣⊱ 💍 *${prefix}pilihwaifu* - Pilih waifu
┣⊱ 💍 *${prefix}pilihusbu* - Pilih husbu
┣⊱ 💒 *${prefix}marry* - Nikah sama member
┣⊱ 💒 *${prefix}marry2* - Nikah (versi 2)
┣⊱ 💒 *${prefix}marrihusbu* - Nikah husbu
┣⊱ 💒 *${prefix}marrihusbu2* - Nikah husbu v2
┣⊱ 💕 *${prefix}kencan* - Kencan bareng
┣⊱ 💕 *${prefix}kencanhusbu* - Kencan husbu
┣⊱ 💕 *${prefix}kencanwaifu* - Kencan waifu
┣⊱ 💔 *${prefix}divorce* - Ceraikan pasangan
┣⊱ 💔 *${prefix}divorcehusbu* - Cerai husbu
┣⊱ 🎲 *${prefix}gachahusbu* - Gacha husbu
┣⊱ 💍 *${prefix}gachawaifu* - Gacha waifu
┃
┣⊱ 🐺 *PARTY GAME*
┣⊱ 🐺 *${prefix}werewolf* - Werewolf game
┣⊱ ♟️ *${prefix}catur* - Main catur 2 pemain
┣⊱ 🎯 *${prefix}truthordare* - Truth or Dare
┣⊱ ⚖️ *${prefix}truth* - Pertanyaan truth
┣⊱ ⚖️ *${prefix}dare* - Tantangan dare
┣⊱ 🎲 *${prefix}suit* - Suit (gunting batu kertas)
┃
┣⊱ 😈 *ISENG-ISENG*
┣⊱ 😈 *${prefix}ewe-paksa* - Paksa orang (reply)
┃
╚════════════════════════════════════╝`

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
