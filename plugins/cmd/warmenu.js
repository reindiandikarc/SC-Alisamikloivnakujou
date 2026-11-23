// Plugin: warmenu (certificatemenu / sertifikatmenu)
// Fixed for Alya V13 — listbut2 dari ctx
// Commands: warmenu, certificatemenu, sertifikatmenu

module.exports = {
  command: ["warmenu", "certificatemenu", "sertifikatmenu"],
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
      listbut2, listbut3
    } = ctx

    let AlyaSad = `╭── • 📜 *CERTIFICATE* • ──╮
┃
┣⊱ 📜 *${prefix}stkbaik*
┣⊱ 📜 *${prefix}stkcantik* <nama>
┣⊱ 📜 *${prefix}stkganteng* <nama>
┣⊱ 📜 *${prefix}stkhitam* <nama>
┣⊱ 📜 *${prefix}stkmiskin* <nama>
┣⊱ 📜 *${prefix}stkkaya* <nama>
┣⊱ 📜 *${prefix}stkmarah* <nama>
┣⊱ 📜 *${prefix}stksabar* <nama>
┣⊱ 📜 *${prefix}stksakiti* <nama>
┣⊱ 📜 *${prefix}stkkeren* <nama>
┣⊱ 📜 *${prefix}stkmisterius* <nama>
┣⊱ 📜 *${prefix}stksantai* <nama>
┣⊱ 📜 *${prefix}stksombong* <nama>
┣⊱ 📜 *${prefix}stklucu* <nama>
┣⊱ 📜 *${prefix}stkgila* <nama>
┃
╰━━━━━━━━━━━━━━━━━━╯`

    const sections = [
      {
        title: "📜 CERTIFICATE COMMANDS",
        rows: [
          { title: "😇 STK BAIK", description: "Sertifikat: Anda dinyatakan Baik!", id: `${prefix}stkbaik` },
          { title: "💄 STK CANTIK", description: "Sertifikat: Anda dinyatakan Cantik!", id: `${prefix}stkcantik` },
          { title: "😎 STK GANTENG", description: "Sertifikat: Anda dinyatakan Ganteng!", id: `${prefix}stkganteng` },
          { title: "🖤 STK HITAM", description: "Sertifikat: Anda dinyatakan Berkelas Hitam!", id: `${prefix}stkhitam` },
          { title: "💸 STK MISKIN", description: "Sertifikat: Anda dinyatakan Miskin!", id: `${prefix}stkmiskin` },
          { title: "💰 STK KAYA", description: "Sertifikat: Anda dinyatakan Kaya!", id: `${prefix}stkkaya` },
          { title: "😤 STK MARAH", description: "Sertifikat: Anda dinyatakan Marah!", id: `${prefix}stkmarah` },
          { title: "🧘 STK SABAR", description: "Sertifikat: Anda dinyatakan Sabar!", id: `${prefix}stksabar` }
        ]
      },
      {
        title: "📜 CERTIFICATE LAINNYA",
        rows: [
          { title: "😈 STK SAKITI", description: "Sertifikat: Anda dinyatakan Suka Menyakiti!", id: `${prefix}stksakiti` },
          { title: "🔥 STK KEREN", description: "Sertifikat: Anda dinyatakan Keren!", id: `${prefix}stkkeren` },
          { title: "🕵️ STK MISTERIUS", description: "Sertifikat: Anda dinyatakan Misterius!", id: `${prefix}stkmisterius` },
          { title: "😌 STK SANTAI", description: "Sertifikat: Anda dinyatakan Santai!", id: `${prefix}stksantai` },
          { title: "👑 STK SOMBONG", description: "Sertifikat: Anda dinyatakan Sombong!", id: `${prefix}stksombong` },
          { title: "😂 STK LUCU", description: "Sertifikat: Anda dinyatakan Lucu!", id: `${prefix}stklucu` },
          { title: "🤪 STK GILA", description: "Sertifikat: Anda dinyatakan Gila!", id: `${prefix}stkgila` }
        ]
      },
      {
        title: "🌟 MENU UTAMA",
        rows: [
          { title: "📦 SEMUA FITUR", description: "Tampilkan semua list perintah bot", id: `${prefix}allmenu` },
          { title: "📜 PERATURAN", description: "Baca aturan penggunaan bot", id: `${prefix}rules` },
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
          { title: "🔍 STALKER MENU", description: "Fitur stalking media sosial", id: `${prefix}stalkermenu` },
          { title: "🖥️ DATABASE MENU", description: "Fitur manajemen database", id: `${prefix}databasemenu` },
          { title: "🔮 PRIMBON MENU", description: "Fitur ramalan dan primbon", id: `${prefix}primbonmenu` },
          { title: "💬 QUOTES MENU", description: "Kumpulan kata-kata bijak", id: `${prefix}quotesmenu` }
        ]
      },
      {
        title: "🎮 GAME & RPG",
        rows: [
          { title: "🕹️ GAME MENU", description: "Kumpulan game seru", id: `${prefix}gamemenu` },
          { title: "🦸 ULTRAMAN GAME", description: "Hero vs Villain, lawan Kaiju!", id: `${prefix}ultraman` },
          { title: "🧰 RPG MENU", description: "Dungeon, Mining, dan Inventory", id: `${prefix}rpgmenu` },
          { title: "🛍️ STORE MENU", description: "Menampilkan fitur jabeh/shop", id: `${prefix}storemenu` }
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
        title: "🥳 FUN & LAIN-LAIN",
        rows: [
          { title: "🥳 FUN MENU", description: "Fitur menyenangkan", id: `${prefix}funmenu` },
          { title: "🕌 ISLAMI MENU", description: "Fitur religi islami", id: `${prefix}islamimenu` },
          { title: "👤 ANONYMOUS", description: "Fitur anonymous chat", id: `${prefix}anonymousmenu` },
          { title: "📮 BERITA MENU", description: "Fitur berita terkini", id: `${prefix}beritamenu` },
          { title: "📪 OTHER MENU", description: "Fitur yang tidak dikategorikan", id: `${prefix}othermenu` }
        ]
      },
      {
        title: "👑 OWNER & ADMIN",
        rows: [
          { title: "👤 OWNER MENU", description: "Khusus untuk pengembang bot", id: `${prefix}ownermenu` },
          { title: "👥 GROUP MENU", description: "Pengaturan grup dan admin", id: `${prefix}groupmenu` }
        ]
      }
    ]

    const listnye = { title: "LIHAT MENU", sections: sections }
    await listbut3(m.chat, AlyaSad, listnye, m)
  }
}
