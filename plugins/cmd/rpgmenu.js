// Plugin: rpgmenu
// Fixed for Alya V13
// Commands: rpgmenu

const path = require('path')

module.exports = {
  command: ["rpgmenu"],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix, body, budy,
      sender, from, pushname, botNumber,
      isCmd, isGroup, isMedia, isImage, isVideo, isAudio, isSticker,
      isQuotedImage, isQuotedVideo, isQuotedSticker, isQuotedAudio,
      isQuotedDocument, isQuotedViewOnce, isQuotedLocation, isQuotedContact,
      groupMetadata, groupName, groupMembers, groupAdmins, groupOwner,
      isBotAdmins, isGroupAdmins, isAdmins, isAdminOrOwner,
      Ryuu, isPrem, isAly, isAlya, isSewa, jangan,
      quoted, mime, qmsg, content, type, chatUpdate, store,
      reply, replyalya, replytolak, replyprem,
      senderNumber, chath, pes, messagesC, bady,
      waifuList, husbuList, pler, setting, user,
      // ✅ FIX: listbut2 diambil dari ctx bukan global
      listbut2, listbut3
    } = ctx

    let AlyaSad = `╭╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╮
┃  ⚔️  *\\\`乂 R P G - M E N U 乂\\\`* ⚔️
╽
┣⊱ 💼 *${prefix}kerja*
┣⊱ 🐉 *${prefix}fightnaga*
┣⊱ 🐈 *${prefix}fightkucing*
┣⊱ 🦅 *${prefix}fightphonix*
┣⊱ 🦁 *${prefix}fightgriffin*
┣⊱ 🦊 *${prefix}fightkyubi*
┣⊱ 🐎 *${prefix}fightcentaur*
┣⊱ 💰 *${prefix}nabung*
┣⊱ ⛏️ *${prefix}mining*
┣⊱ 🏦 *${prefix}bankcek*
┣⊱ 🥷 *${prefix}maling*
┣⊱ 🏧 *${prefix}banknabung*
┣⊱ 🏧 *${prefix}banktarik*
┣⊱ 🌿 *${prefix}berkebon*
┣⊱ 🔨 *${prefix}crafting*
┣⊱ 🎲 *${prefix}bet*
┣⊱ 🎁 *${prefix}bonus*
┣⊱ 🍎 *${prefix}buah*
┣⊱ 🪓 *${prefix}nebang*
┣⊱ 👷 *${prefix}bekerja*
┣⊱ 🏛️ *${prefix}bansos*
┣⊱ 🚕 *${prefix}taxy*
┣⊱ 🗑️ *${prefix}mulung*
┣⊱ 🏹 *${prefix}berburu*
┣⊱ 👮 *${prefix}polisi*
┣⊱ 🏪 *${prefix}berdagang*
┣⊱ 🔫 *${prefix}rampok*
┣⊱ 🔪 *${prefix}bunuh*
┣⊱ 💎 *${prefix}collect*
┣⊱ 🎣 *${prefix}mancing*
┣⊱ 🛠️ *${prefix}repair*
┣⊱ 🍱 *${prefix}feed*
┣⊱ ⚔️ *${prefix}duel*
┣⊱ 💸 *${prefix}gajian*
┣⊱ 🆙 *${prefix}upgrade*
┣⊱ 💸 *${prefix}transfer*
┣⊱ 🛒 *${prefix}shop*
┣⊱ 🔮 *${prefix}selectskill*
┣⊱ 🗑️ *${prefix}sampah*
┣⊱ 🚀 *${prefix}roket*
┣⊱ 🛵 *${prefix}ojek*
┣⊱ 🏗️ *${prefix}nguli*
┣⊱ 🏪 *${prefix}pasar*
┣⊱ 🥷 *${prefix}rob*
┣⊱ 🔗 *${prefix}referal*
┣⊱ 🐾 *${prefix}petshop*
┣⊱ 🌊 *${prefix}kolam*
┣⊱ 🤠 *${prefix}koboy*
┣⊱ 🏆 *${prefix}leaderboard*
┣⊱ 🎰 *${prefix}casino*
┣⊱ ⚔️ *${prefix}duel*
┣⊱ 🛡️ *${prefix}pilihclass*
┣⊱ 🌸 *${prefix}loginisekai*
┣⊱ 🗺️ *${prefix}explore*
┣⊱ 👹 *${prefix}bossraid*
┣⊱ 🏰 *${prefix}guild*
┣⊱ 📜 *${prefix}guildstats*
┣⊱ ✅ *${prefix}guildcheckquest*
┣⊱ 👹 *${prefix}tantangbos*
┣⊱ 🔫 *${prefix}heist*
┣⊱ 🃏 *${prefix}poker3*
┣⊱ 👊 *${prefix}fight*
┣⊱ 🎫 *${prefix}Lotre*
┣⊱ ⚔️ *${prefix}battle*
┣⊱ 📈 *${prefix}hilo*
┣⊱ 🔫 *${prefix}rr*
┣⊱ 📊 *${prefix}mystats*
┣⊱ 📈 *${prefix}statusopen*
┣⊱ 💣 *${prefix}bomb*
┣⊱ 🗺️ *${prefix}petualang*
┣⊱ 🥋 *${prefix}perangsarung*
┣⊱ 🎲 *${prefix}ulartangga*
┣⊱ 🐓 *${prefix}sabung*
┣⊱ 📈 *${prefix}invest*
┣⊱ 📁 *${prefix}portofolio*
┣⊱ 🌑 *${prefix}blackinvest*
┣⊱ 🥷 *${prefix}begal*
┣⊱ 🎰 *${prefix}slot*
┣⊱ 🏎️ *${prefix}balapan*
┣⊱ 🌴 *${prefix}nyawit*
┣⊱ ── RPG LANJUTAN (command tersembunyi) ──
┣⊱ 🏰 *${prefix}dungeon* | *${prefix}explore* | *${prefix}loginisekai*
┣⊱ 🎒 *${prefix}inventory* | *${prefix}me* | *${prefix}profil*
┣⊱ 🏰 *${prefix}guild* | *${prefix}guildstats* | *${prefix}guildcheckquest*
┣⊱ 👹 *${prefix}bossraid* | *${prefix}tantangbos*
┣⊱ 🗡️ *${prefix}inventoryweapon* | *${prefix}pilihweapon* | *${prefix}equipweapon*
┣⊱ ⚔️ *${prefix}gachaweapon* | *${prefix}upgradeweapon* | *${prefix}setlevelweapon*
┣⊱ 🛡️ *${prefix}selectclass* | *${prefix}setclass* | *${prefix}setlevelclass*
┣⊱ 📊 *${prefix}levelinfo* | *${prefix}resetlevel* | *${prefix}tambahexp*
┣⊱ 📈 *${prefix}chatstat* | *${prefix}statcku* | *${prefix}levelchat*
┣⊱ 🏆 *${prefix}leaderboardchat* | *${prefix}topchat* | *${prefix}topchatter*
┣⊱ 💰 *${prefix}money* | *${prefix}cekuang* | *${prefix}dompet*
┣⊱ 🛒 *${prefix}shop* | *${prefix}blackshop* | *${prefix}buy* | *${prefix}sell*
┣⊱ 🎰 *${prefix}slot1* | *${prefix}highlow* | *${prefix}poker3* | *${prefix}raffle*
┣⊱ 📈 *${prefix}invest* | *${prefix}investvip* | *${prefix}portofolio*
┣⊱ 🔫 *${prefix}rampokbank* | *${prefix}robery* | *${prefix}ngepet*
┣⊱ ⚔️ *${prefix}duel* | *${prefix}battle* | *${prefix}fighting* | *${prefix}perangnaga*
┣⊱ 🏆 *${prefix}tophighplayer* | *${prefix}topplayer* | *${prefix}toppower*
┣⊱ 💍 *${prefix}mywaifu* | *${prefix}istriku* | *${prefix}pilihwaifu*
┣⊱ 🤍 *${prefix}pilihhusbu* | *${prefix}gachahusbu* | *${prefix}marry2*
┣⊱ 💕 *${prefix}kencan* | *${prefix}kencanwaifu* | *${prefix}kencanhusbu*
┣⊱ 💔 *${prefix}cerihusbu* | *${prefix}divorcehusbu* | *${prefix}lahiranwaifu*
┣⊱ 🌸 *${prefix}jadianime* | *${prefix}toanime* | *${prefix}animefyme*
┃
╰╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╯`

    const sections = [
      {
        title: "🌟 MENU UTAMA",
        rows: [
          { title: "📦 SEMUA FITUR", description: "📌 Tampilkan semua list perintah bot", id: `${prefix}allmenu` },
          { title: "📜 PERATURAN", description: "🎉 Baca aturan penggunaan bot", id: `${prefix}rules` },
          { title: "🆕 FITUR BARU", description: "Update fitur terbaru Alya", id: `${prefix}newfitur` },
          { title: "💸 DONASI", description: "Donasi bot agar dapat berkembang", id: `${prefix}donasi` },
          { title: "🌟 RATING", description: "Rating bot ini", id: `${prefix}rating` },
          { title: "📋 INFO BOT", description: "Menampilkan informasi bot", id: `${prefix}infobot` },
          { title: "🔄 UPDATE MENU", description: "Lihat update terbaru Alya V13", id: `${prefix}updatemenu` }
        ]
      },
      {
        title: "🎮 GAME & RPG",
        rows: [
          { title: "🕹️ GAME MENU", description: "Kumpulan game seru", id: `${prefix}gamemenu` },
          { title: "🦸 ULTRAMAN GAME", description: "Hero vs Villain, lawan Kaiju!", id: `${prefix}ultraman` },
          { title: "🧰 RPG MENU", description: "Dungeon, Mining, & Inventory", id: `${prefix}rpgmenu` },
          { title: "🛍️ STORE MENU", description: "Menampilkan fitur jabeh/shop", id: `${prefix}storemenu` }
        ]
      },
      {
        title: "🛠️ TOOLS & AI",
        rows: [
          { title: "🤖 AI MENU", description: "Fitur kecerdasan buatan", id: `${prefix}aimenu` },
          { title: "🎭 SET ROLE AI", description: "Atur hubunganmu dengan Alya", id: `${prefix}setrole` },
          { title: "📝 STICKER MENU", description: "Kumpulan fitur pembuat sticker", id: `${prefix}stickermenu` },
          { title: "🔍 STALKER MENU", description: "Fitur stalking media sosial", id: `${prefix}stalkermenu` },
          { title: "🖥️ DATABASE MENU", description: "Fitur manajemen database", id: `${prefix}databasemenu` },
          { title: "🔮 PRIMBON MENU", description: "Fitur ramalan & primbon", id: `${prefix}primbonmenu` },
          { title: "💬 QUOTES MENU", description: "Kumpulan kata-kata bijak", id: `${prefix}quotesmenu` },
          { title: "📶 CEK KUOTA", description: "Cek kuota internet semua operator", id: `${prefix}cekkuota` },
          { title: "💰 CEK PULSA", description: "Cek saldo pulsa semua operator", id: `${prefix}cekpulsa` }
        ]
      },
      {
        title: "📂 DOWNLOADER & MEDIA",
        rows: [
          { title: "📂 DOWNLOADER", description: "Tiktok, YT, IG Downloader", id: `${prefix}downloadmenu` },
          { title: "🎥 RANDOM VIDEO", description: "Menampilkan fitur random video", id: `${prefix}randomvideomenu` },
          { title: "📷 RANDOM PHOTO", description: "Menampilkan fitur random foto", id: `${prefix}randomphotomenu` },
          { title: "🔞 NSFW MENU", description: "Menampilkan fitur 18+", id: `${prefix}nsfwmenu` }
        ]
      },
      {
        title: "🎨 EDIT FOTO & ANIME",
        rows: [
          { title: "🎨 EDIT FOTO", description: "Ephoto360 & Maker", id: `${prefix}ephoto360menu` },
          { title: "🤍 ANIME MENU", description: "Kumpulan fitur anime", id: `${prefix}animemenu` }
        ]
      },
      {
        title: "🌐 PANEL & HOSTING",
        rows: [
          { title: "🛠️ CPANEL MENU", description: "Fitur create panel", id: `${prefix}cpanelmenu` },
          { title: "⚙️ PTERODACTYL", description: "Fitur manajemen Pterodactyl", id: `${prefix}pyterodactylemenu` },
          { title: "🌊 DIGITAL OCEAN", description: "Fitur manajemen Digital Ocean", id: `${prefix}digitaloceanmenu` },
          { title: "🌐 DOMAIN MENU", description: "Fitur create subdomain", id: `${prefix}domainmenu` }
        ]
      },
      {
        title: "🥳 FUN & LAIN-LAIN",
        rows: [
          { title: "🥳 FUN MENU", description: "Fitur menyenangkan", id: `${prefix}funmenu` },
          { title: "🕌 ISLAMI MENU", description: "Fitur religi islami", id: `${prefix}islamimenu` },
          { title: "👤 ANONYMOUS", description: "Fitur anonymous chat", id: `${prefix}anonymousmenu` },
          { title: "📮 BERITA MENU", description: "Fitur berita terkini", id: `${prefix}beritamenu` },
          { title: "🚆 TRANSPORTASI MENU", description: "Jadwal kereta & pesawat Indonesia", id: `${prefix}transportasimenu` },
          { title: "💾 PUSH MENU", description: "Fitur push kontak/broadcast", id: `${prefix}pushmenu` },
          { title: "🐛 BUG MENU", description: "Fitur bug WhatsApp", id: `${prefix}bugmenu` },
          { title: "📪 OTHER MENU", description: "Fitur yang tidak dikategorikan", id: `${prefix}othermenu` }
        ]
      },
      {
        title: "👑 OWNER & ADMIN",
        rows: [
          { title: "👤 OWNER MENU", description: "Khusus untuk pengembang bot", id: `${prefix}ownermenu` },
          { title: "👥 GROUP MENU", description: "Pengaturan grup & admin", id: `${prefix}groupmenu` }
        ]
      }
    ]

    const listnye = {
      title: "LIHAT MENU",
      sections: sections
    }

    // ✅ FIX: await agar menu benar-benar terkirim
    await listbut3(m.chat, AlyaSad, listnye, m)
  }
}
