// Plugin: groupmenu
// Fixed for Alya V13
// Commands: groupmenu

const path = require('path')

module.exports = {
  command: ["groupmenu"],
  tags: ['group'],
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

    let AlyaSad = `╭┈┈ • 👥 *GROUP MENU* • ┈┈╮
┃
┣⊱ 🕵️ *${prefix}sider*
┣⊱ 🛡️ *${prefix}antinsfw*
┣⊱ 🤖 *${prefix}autoaigc*
┣⊱ 🤙 *${prefix}warcall*
┣⊱ 🤖 *${prefix}autosimi*
┣⊱ 💬 *${prefix}alyachat*
┣⊱ 💬 *${prefix}alyachatv2*
┣⊱ 👑 *${prefix}adminonly*
┣⊱ 🎫 *${prefix}setwelcome* - Set pesan welcome
┣⊱ 🚪 *${prefix}setleft* - Set pesan left
┣⊱ 🔔 *${prefix}welcome on/off* - Toggle welcome
┣⊱ 🔔 *${prefix}left on/off* - Toggle left message
┣⊱ 🔗 *${prefix}antilink*
┣⊱ 🔗 *${prefix}antiwame*
┣⊱ 🔗 *${prefix}linkgc*
┣⊱ 📥 *${prefix}invite*
┣⊱ ⏳ *${prefix}ephemeral*
┣⊱ 🗑️ *${prefix}delete*
┣⊱ 🖼️ *${prefix}setppgroup*
┣⊱ 🗑️ *${prefix}delppgroup*
┣⊱ 📝 *${prefix}setname*
┣⊱ 📝 *${prefix}setdesc*
┣⊱ ➕ *${prefix}add*
┣⊱ ➖ *${prefix}kick*
┣⊱ 🔇 *${prefix}mute* - Mute member (reply/tag)
┣⊱ 🔔 *${prefix}unmute* - Buka mute member
┣⊱ 📋 *${prefix}mutelist* - Daftar member di-mute
┣⊱ 🆙 *${prefix}promote*
┣⊱ 🔽 *${prefix}demote*
┣⊱ 📢 *${prefix}hidetag*
┣⊱ 📢 *${prefix}totag*
┣⊱ 📢 *${prefix}tagall*
┣⊱ 📝 *${prefix}editinfo*
┣⊱ 🔓 *${prefix}opentime*
┣⊱ 🔒 *${prefix}closetime*
┣⊱ 🔄 *${prefix}resetlink*
┣⊱ 📝 *${prefix}getbio*
┣⊱ 📊 *${prefix}vote*
┣⊱ 🆙 *${prefix}upvote*
┣⊱ 👑 *${prefix}tagadmin*
┣⊱ 🌐 *${prefix}listonline*
┣⊱ 🔽 *${prefix}downvote*
┣⊱ 📊 *${prefix}checkvote*
┣⊱ 🗑️ *${prefix}delvote*
┣⊱ 📁 *${prefix}autostickergc*
┣⊱ 🔗 *${prefix}antilinkgc*
┣⊱ 🔗 *${prefix}antilinkch*
┣⊱ 🔗 *${prefix}antiwame*
┣⊱ 🔗 *${prefix}antilinkall*
┣⊱ 🔗 *${prefix}antilinktiktok*
┣⊱ 🔗 *${prefix}antilinkfb*
┣⊱ 🔗 *${prefix}antilinktwitter*
┣⊱ 🔗 *${prefix}antilinkig*
┣⊱ 🔗 *${prefix}antilinktg*
┣⊱ 🔗 *${prefix}antilinkytvid*
┣⊱ 🔗 *${prefix}antilinkytch*
┣⊱ 🛡️ *${prefix}antivirus*
┣⊱ 🤐 *${prefix}antitoxic*
┣⊱ 🤖 *${prefix}antibot*
┣⊱ 🛡️ *${prefix}antispam*
┣⊱ 🛡️ *${prefix}antidelete*
┣⊱ ❤️ *${prefix}react*
┃
╰━━━━━━━━━━━━━━━━━━━━╯`

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
