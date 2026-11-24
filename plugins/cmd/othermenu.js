// Plugin: othermenu
// Fixed for Alya V13
// Commands: othermenu

const path = require('path')

module.exports = {
  command: ["othermenu"],
  tags: ['other'],
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

    let AlyaSad = `┎┈┈┈ • 🔮 *OTHER MENU* 🔮 • ┈┈┈┒
┃
┣⊱ 📝 *${prefix}daftar*
┣⊱ 👑 *${prefix}tagadmin*
┣⊱ 👨‍🦲 *${prefix}botak*
┣⊱ 🌐 *${prefix}listonline* - Lihat member online
┣⊱ 🎥 *${prefix}tomp4* - Konversi video ke MP4
┣⊱ 🔄 *${prefix}rvo* - Baca pesan sekali lihat (view once)
┣⊱ 🤥 *${prefix}fitnah*
┣⊱ 🧕 *${prefix}hijabkan*
┣⊱ 🎨 *${prefix}edit (foto)*
┣⊱ 🚻 *${prefix}ubahgender*
┣⊱ 📩 *${prefix}nglspam*
┣⊱ 👳 *${prefix}paustad*
┣⊱ 🔝 *${prefix}upgc*
┣⊱ 💱 *${prefix}konversi* - Konversi mata uang (ex: .konversi 100 USD IDR)
┣⊱ 📶 *${prefix}ping*
┣⊱ 🍀 *${prefix}tqtoto*
┣⊱ 🖋️ *${prefix}ttp*
┣⊱ 🖋️ *${prefix}brat*
┣⊱ 🎞️ *${prefix}bratvid*
┣⊱ 📊 *${prefix}totalchat*
┣⊱ 🌑 *${prefix}hytam*
┣⊱ 🆔 *${prefix}cekidch*
┣⊱ 📅 *${prefix}ceksewa*
┣⊱ 📜 *${prefix}listsewa*
┣⊱ 👁️ *${prefix}readviewonce* | *${prefix}rvome*
┣⊱ 🔮 *${prefix}cekkhodam*
┣⊱ 📖 *${prefix}alkitab*
┣⊱ ⚙️ *${prefix}totalfitur*
┣⊱ 📜 *${prefix}menu*
┣⊱ 🌐 *${prefix}myip*
┣⊱ 🐞 *${prefix}reportbug*
┣⊱ 👤 *${prefix}listpem*
┣⊱ 📁 *${prefix}liststicker*
┣⊱ 🖼️ *${prefix}listimage*
┣⊱ 🎥 *${prefix}listvideo*
┣⊱ 🎤 *${prefix}listvn*
┣⊱ 🤐 *${prefix}listbadword*
┣⊱ 📱 *${prefix}listpc*
┣⊱ 👥 *${prefix}listgc*
┣⊱ 👑 *${prefix}owner*
┣⊱ 🤖 *${prefix}jadibot*
┣⊱ 📜 *${prefix}listjadibot*
┣⊱ ☕ *${prefix}donate*
┣⊱ 🤝 *${prefix}friend*
┣⊱ 🔐 *${prefix}obfuscate*
┣⊱ 🖋️ *${prefix}styletext*
┣⊱ 🔃 *${prefix}fliptext*
┣⊱ 🗣️ *${prefix}tts*
┣⊱ 💬 *${prefix}say*
┣⊱ 🎞️ *${prefix}togif*
┣⊱ 🏁 *${prefix}toqr*
┣⊱ 🔊 *${prefix}bass*
┣⊱ 🌬️ *${prefix}blown*
┣⊱ 🌊 *${prefix}deep*
┣⊱ 📢 *${prefix}earrape*
┣⊱ ⏩ *${prefix}fast*
┣⊱ 🍔 *${prefix}fat*
┣⊱ 🌙 *${prefix}nightcore*
┣⊱ ⏪ *${prefix}reverse*
┣⊱ 🤖 *${prefix}robot*
┣⊱ 🐢 *${prefix}slow*
┣⊱ 🧊 *${prefix}smooth*
┣⊱ 🐿️ *${prefix}squirrel*
┣⊱ 🔗 *${prefix}tinyurl*
┣⊱ 🔗 *${prefix}tinyurl*
┣⊱ 🎤 *${prefix}tovn*
┣⊱ 🎧 *${prefix}toaudio*
┣⊱ 🎵 *${prefix}tomp3*
┣⊱ 📽️ *${prefix}tomp4*
┣⊱ 🖼️ *${prefix}toimg*
┣⊱ 👁️ *${prefix}toonce*
┣⊱ 📁 *${prefix}sticker*
┣⊱ 📥 *${prefix}take*
┣⊱ 🙂 *${prefix}emoji*
┣⊱ 🔊 *${prefix}volume*
┣⊱ 🔢 *${prefix}ebinary*
┣⊱ 🔢 *${prefix}dbinary*
┣⊱ 📸 *${prefix}ssweb*
┣⊱ 💬 *${prefix}quoted*
┣⊱ ⏳ *${prefix}runtime*
┣⊱ 🎮 *${prefix}fakeml*
┣⊱ 💻 *${prefix}fakedev*
┣⊱ 👥 *${prefix}fakegc*
┣⊱ 💸 *${prefix}fakedana*
┣⊱ 🔫 *${prefix}lobbyff*
┣⊱ 📦 *${prefix}web2zip*
┃
┖┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┚`

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

    // ✅ FIX: await agar menu benar-benar terkirim, bukan hanya react
    await listbut3(m.chat, AlyaSad, listnye, m)
  }
}
