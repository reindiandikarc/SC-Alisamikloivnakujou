// Plugin: beritamenu
// Fixed for Alya V13
// Commands: beritamenu

const path = require('path')

module.exports = {
  command: ["beritamenu"],
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
      // 2705 FIX: listbut2 diambil dari ctx bukan global
      listbut2, listbut3
    } = ctx

      let AlyaSad = `╭── • 📰 *BERITA* • ──╮
┃
┣⊱ ⚽ *${prefix}beritabola*
┣⊱ 📰 *${prefix}fajar*
┣⊱ 📺 *${prefix}cnn*
┣⊱ 🎬 *${prefix}layarkaca*
┣⊱ 📈 *${prefix}cnbc*
┣⊱ 📰 *${prefix}tribun*
┣⊱ 📰 *${prefix}indozone*
┣⊱ 📰 *${prefix}kompas*
┣⊱ 📰 *${prefix}detiknews*
┣⊱ 📰 *${prefix}dailynews*
┣⊱ 📺 *${prefix}inews*
┣⊱ 📰 *${prefix}okezone*
┣⊱ 📰 *${prefix}sindo*
┣⊱ 📰 *${prefix}tempo*
┣⊱ 📰 *${prefix}antara*
┣⊱ 📰 *${prefix}kontan*
┣⊱ 📰 *${prefix}merdeka*
┣⊱ 📱 *${prefix}jalantikus*
┃
╰━━━━━━━━━━━━━━━━━━╯`
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
                { title: "📪 OTHER MENU", description: "Fitur yang tidak dikategorikan", id: `${prefix}othermenu` },
            ]
        },
        {
            title: "👑 OWNER & ADMIN",
            rows: [
                { title: "👤 OWNER MENU", description: "Khusus untuk pengembang bot", id: `${prefix}ownermenu` },
                { title: "👥 GROUP MENU", description: "Pengaturan grup & admin", id: `${prefix}groupmenu` }
            ]
        }
    ];
        const listnye = {
            title: "LIHAT MENU",
            sections: sections
        };

    	await listbut3(m.chat, AlyaSad, listnye, m);
  }
}
