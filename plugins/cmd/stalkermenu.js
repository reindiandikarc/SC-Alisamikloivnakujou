// Plugin: stalkermenu
// Fixed & Upgraded for Alya V13
// Commands: stalkermenu

module.exports = {
  command: ["stalkermenu"],
  tags: ['info'],
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
      listbut2, listbut3
    } = ctx

    let AlyaSad = `╭── • 🕵️ *STALKER MENU* • ──╮
┃
┣⊱ 📸 *${prefix}igstalk* <username>
┣⊱ 📱 *${prefix}ttstalk* <username>
┣⊱ 🔫 *${prefix}ffstalk* <uid>
┣⊱ 🎮 *${prefix}mlstalk* <uid|zone>
┣⊱ 📦 *${prefix}npmstalk* <package>
┣⊱ 📁 *${prefix}ghstalk* <username>
┣⊱ 📺 *${prefix}ytstalk* <channel>
┣⊱ 🎮 *${prefix}robloxstalk* <username>
┣⊱ 💬 *${prefix}wastalker* <nomor>
┣⊱ 🌟 *${prefix}genshinstalk* <uid>
┃
╰━━━━━━━━━━━━━━━━━━╯`

    const sections = [
      {
        title: "🔍 STALKER COMMANDS",
        rows: [
          { title: "📸 INSTAGRAM STALK", description: "Stalk akun Instagram", id: `${prefix}igstalk` },
          { title: "📱 TIKTOK STALK", description: "Stalk akun TikTok", id: `${prefix}ttstalk` },
          { title: "🔫 FREE FIRE STALK", description: "Stalk akun Free Fire", id: `${prefix}ffstalk` },
          { title: "🎮 ML STALK", description: "Stalk akun Mobile Legends + DD Checker", id: `${prefix}mlstalk` },
          { title: "📦 NPM STALK", description: "Stalk package NPM", id: `${prefix}npmstalk` },
          { title: "📁 GITHUB STALK", description: "Stalk profil GitHub", id: `${prefix}ghstalk` },
          { title: "📺 YOUTUBE STALK", description: "Stalk channel YouTube", id: `${prefix}ytstalk` },
          { title: "🎮 ROBLOX STALK", description: "Stalk akun Roblox", id: `${prefix}robloxstalk` },
          { title: "💬 WHATSAPP STALK", description: "Stalk nomor WhatsApp", id: `${prefix}wastalker` },
          { title: "🌟 GENSHIN STALK", description: "Stalk akun Genshin Impact", id: `${prefix}genshinstalk` }
        ]
      },
      {
        title: "🌟 MENU UTAMA",
        rows: [
          { title: "📦 SEMUA FITUR", description: "📌 Tampilkan semua list perintah bot", id: `${prefix}allmenu` },
          { title: "📜 PERATURAN", description: "🎉 Baca aturan penggunaan bot", id: `${prefix}rules` },
          { title: "🆕 FITUR BARU", description: "Update fitur terbaru Alya", id: `${prefix}newfitur` },
          { title: "💸 DONASI", description: "Donasi bot agar dapat berkembang", id: `${prefix}donasi` },
          { title: "📋 INFO BOT", description: "Menampilkan informasi bot", id: `${prefix}infobot` },
          { title: "🔄 UPDATE MENU", description: "Lihat update terbaru Alya V13", id: `${prefix}updatemenu` }
        ]
      },
      {
        title: "🛠️ TOOLS & AI",
        rows: [
          { title: "🤖 AI MENU", description: "Fitur kecerdasan buatan", id: `${prefix}aimenu` },
          { title: "📝 STICKER MENU", description: "Kumpulan fitur pembuat sticker", id: `${prefix}stickermenu` },
          { title: "🖥️ DATABASE MENU", description: "Fitur manajemen database", id: `${prefix}databasemenu` },
          { title: "🔮 PRIMBON MENU", description: "Fitur ramalan & primbon", id: `${prefix}primbonmenu` },
          { title: "📜 CERTIFICATE MENU", description: "Fitur sertifikat sifat", id: `${prefix}warmenu` }
        ]
      },
      {
        title: "🎮 GAME & RPG",
        rows: [
          { title: "🕹️ GAME MENU", description: "Kumpulan game seru", id: `${prefix}gamemenu` },
          { title: "🦸 ULTRAMAN GAME", description: "Hero vs Villain, lawan Kaiju!", id: `${prefix}ultraman` },
          { title: "🧰 RPG MENU", description: "Dungeon, Mining, & Inventory", id: `${prefix}rpgmenu` }
        ]
      },
      {
        title: "📂 DOWNLOADER & MEDIA",
        rows: [
          { title: "📂 DOWNLOADER", description: "Tiktok, YT, IG Downloader", id: `${prefix}downloadmenu` },
          { title: "🎥 RANDOM VIDEO", description: "Menampilkan fitur random video", id: `${prefix}randomvideomenu` },
          { title: "📷 RANDOM PHOTO", description: "Menampilkan fitur random foto", id: `${prefix}randomphotomenu` }
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

    await listbut3(m.chat, AlyaSad, listnye, m)
  }
}
