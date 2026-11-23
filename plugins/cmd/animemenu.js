// Plugin: animemenu
// Fixed for Alya V13
// Commands: animemenu

const path = require('path')

module.exports = {
  command: ["animemenu"],
  tags: ['anime'],
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

    let AlyaSad = `╔══ 💠 *「 ANIME INFO 」* 💠 ══╗
┃
┣⊱ ⛩️ *${prefix}otakudesu*
┣⊱ 🔍 *${prefix}animefinder*
┣⊱ 📰 *${prefix}kaorinusantara*
┣⊱ 🌸 *${prefix}akira*
┣⊱ 🌸 *${prefix}akiyama*
┣⊱ 🌸 *${prefix}ana*
┣⊱ 🌸 *${prefix}asuna*
┣⊱ 🌸 *${prefix}ayuzawa*
┣⊱ 🌸 *${prefix}boruto*
┣⊱ 🌸 *${prefix}chiho*
┣⊱ 🌸 *${prefix}chitoge*
┣⊱ 🎭 *${prefix}cosplayloli*
┣⊱ 🎭 *${prefix}cosplaysagiri*
┣⊱ 👺 *${prefix}deidara*
┣⊱ 🐱 *${prefix}doraemon*
┣⊱ 🧙‍♀️ *${prefix}elaina*
┣⊱ 🤍 *${prefix}emilia*
┣⊱ ⚔️ *${prefix}erza*
┣⊱ 👿 *${prefix}gremory*
┣⊱ 🏛️ *${prefix}hestia*
┣⊱ 💜 *${prefix}hinata*
┣⊱ 👦 *${prefix}husbu*
┣⊱ 🎶 *${prefix}inori*
┣⊱ 🔫 *${prefix}isuzu*
┣⊱ 👁️ *${prefix}itachi*
┣⊱ ☕ *${prefix}itori*
┣⊱ 🚢 *${prefix}kaga*
┣⊱ 🌂 *${prefix}kagura*
┣⊱ ⚡ *${prefix}kakasih*
┣⊱ 🎻 *${prefix}kaori*
┣⊱ 💀 *${prefix}keneki*
┣⊱ 🐥 *${prefix}kotori*
┣⊱ 🕒 *${prefix}kurumi*
┣⊱ 👧 *${prefix}loli*
┣⊱ ☄️ *${prefix}madara*
┣⊱ 💥 *${prefix}megumin*
┣⊱ 🧣 *${prefix}mikasa*
┣⊱ 🏍️ *${prefix}mikey*
┣⊱ 🎧 *${prefix}miku*
┣⊱ 🌪️ *${prefix}minato*
┣⊱ 🍥 *${prefix}naruto*
┣⊱ 🐾 *${prefix}neko*
┣⊱ 🐾 *${prefix}neko2*
┣⊱ 🐾 *${prefix}nekonime*
┣⊱ 🎋 *${prefix}nezuko*
┣⊱ 🏴‍☠️ *${prefix}onepiece*
┣⊱ ⚡ *${prefix}pokemon*
┣⊱ 🎲 *${prefix}randomnime*
┣⊱ 🎲 *${prefix}randomnime2*
┣⊱ 🍴 *${prefix}rize*
┣⊱ 🎨 *${prefix}sagiri*
┣⊱ 🌸 *${prefix}sakura*
┣⊱ 🐍 *${prefix}sasuke*
┣⊱ 🧊 *${prefix}shina*
┣⊱ 💫 *${prefix}shinka*
┣⊱ 🧊 *${prefix}shinomiya*
┣⊱ 👓 *${prefix}shizuka*
┣⊱ 🧒 *${prefix}shota*
┣⊱ 🎩 *${prefix}tejina*
┣⊱ ☕ *${prefix}toukachan*
┣⊱ 🐌 *${prefix}tsunade*
┣⊱ 💍 *${prefix}waifu*
┣⊱ 🖼️ *${prefix}animewall*
┣⊱ 🍀 *${prefix}yotsuba*
┣⊱ ❄️ *${prefix}yuki*
┣⊱ 🃏 *${prefix}yumeko*
┣⊱ 🎱 *${prefix}8ball*
┣⊱ 👣 *${prefix}tickle*
┣⊱ 🖼️ *${prefix}gecg*
┣⊱ 🍱 *${prefix}feed*
┣⊱ 🐺 *${prefix}animeawoo*
┣⊱ 💥 *${prefix}animemegumin*
┣⊱ 🦋 *${prefix}animeshinobu*
┣⊱ 🤝 *${prefix}animehandhold*
┣⊱ ✋ *${prefix}animehighfive*
┣⊱ 😬 *${prefix}animecringe*
┣⊱ 💃 *${prefix}animedance*
┣⊱ ️😊 *${prefix}animehappy*
┣⊱ 🫂 *${prefix}animeglomp*
┣⊱ 😳 *${prefix}animeblush*
┣⊱ 😏 *${prefix}animesmug*
┣⊱ 👋 *${prefix}animewave*
┣⊱ 😁 *${prefix}animesmile*
┣⊱ 👉 *${prefix}animepoke*
┣⊱ 😉 *${prefix}animewink*
┣⊱ 🔨 *${prefix}animebonk*
┣⊱ 👊 *${prefix}animebully*
┣⊱ 🚀 *${prefix}animeyeet*
┣⊱ 🦷 *${prefix}animebite*
┣⊱ 👅 *${prefix}animelick*
┣⊱ 🗡️ *${prefix}animekill*
┣⊱ 😭 *${prefix}animecry*
┣⊱ 🖼️ *${prefix}animewlp*
┣⊱ 💋 *${prefix}animekiss*
┣⊱ 🫂 *${prefix}animehug*
┣⊱ 🐾 *${prefix}animeneko*
┣⊱ 💆 *${prefix}animepat*
┣⊱ 👋 *${prefix}animeslap*
┣⊱ 🧸 *${prefix}animecuddle*
┣⊱ 💍 *${prefix}animewaifu*
┣⊱ 😋 *${prefix}animenom*
┣⊱ 🦊 *${prefix}animefoxgirl*
┣⊱ 🖼️ *${prefix}animegecg*
┣⊱ 👣 *${prefix}animetickle*
┣⊱ 🍱 *${prefix}animefeed*
┣⊱ 👤 *${prefix}animeavatar*
┣⊱ 🌌 *${prefix}genshin*
┣⊱ 🎌 *${prefix}anime*
┣⊱ 🎞️ *${prefix}amv*
┣⊱ 📅 *${prefix}animeschedule* - Jadwal anime musim ini
┃
╚════════════════════╝`

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
