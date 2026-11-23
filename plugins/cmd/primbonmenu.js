// Plugin: primbonmenu
// Fixed for Alya V13 — listbut2 dari ctx
// Commands: primbonmenu

module.exports = {
  command: ["primbonmenu"],
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

    let AlyaSad = `╭── • 🔮 *PRIMBON* • ──╮
┃
┣⊱ 🔮 *${prefix}artimimpi*
┣⊱ 🔮 *${prefix}artinama*
┣⊱ 🔮 *${prefix}ramalanjodoh*
┣⊱ 🔮 *${prefix}ramalanjodohbali*
┣⊱ 🔮 *${prefix}suamiistri*
┣⊱ 🔮 *${prefix}ramalancinta*
┣⊱ 🔮 *${prefix}kecocokannama*
┣⊱ 🔮 *${prefix}kecocokanpasangan*
┣⊱ 🔮 *${prefix}jadiannikah*
┣⊱ 🔮 *${prefix}sifatusaha*
┣⊱ 🔮 *${prefix}rezeki*
┣⊱ 🔮 *${prefix}pekerjaan*
┣⊱ 🔮 *${prefix}ramalannasib*
┣⊱ 🔮 *${prefix}potensipenyakit*
┣⊱ 🔮 *${prefix}artitarot*
┣⊱ 🔮 *${prefix}fengshui*
┣⊱ 🔮 *${prefix}haribaik*
┣⊱ 🔮 *${prefix}harisangar*
┣⊱ 🔮 *${prefix}harisial*
┣⊱ 🔮 *${prefix}nagahari*
┣⊱ 🔮 *${prefix}peruntungan*
┣⊱ 🔮 *${prefix}peruntungan*
┣⊱ 🔮 *${prefix}weton*
┣⊱ 🔮 *${prefix}weton*
┣⊱ 🔮 *${prefix}keberuntungan*
┣⊱ 🔮 *${prefix}memancing*
┣⊱ 🔮 *${prefix}masasubur*
┣⊱ 🔮 *${prefix}zodiak*
┣⊱ 🔮 *${prefix}shio*
┃
╰━━━━━━━━━━━━━━━━━━╯`

    const sections = [
      {
        title: "🔮 RAMALAN JODOH & CINTA",
        rows: [
          { title: "💑 RAMAL JODOH", description: "Cek kecocokan jodoh kamu", id: `${prefix}ramalanjodoh` },
          { title: "💑 RAMAL JODOH BALI", description: "Kecocokan jodoh versi Bali", id: `${prefix}ramalanjodohbali` },
          { title: "💍 SUAMI ISTRI", description: "Cocok jadi suami/istri?", id: `${prefix}suamiistri` },
          { title: "❤️ RAMAL CINTA", description: "Ramalan cintamu hari ini", id: `${prefix}ramalancinta` },
          { title: "🤝 COCOK NAMA", description: "Cek kecocokan dua nama", id: `${prefix}kecocokannama` },
          { title: "👫 PASANGAN", description: "Siapa pasangan idealmu?", id: `${prefix}kecocokanpasangan` },
          { title: "💒 JADIAN NIKAH", description: "Kapan kamu jadian/nikah?", id: `${prefix}jadiannikah` }
        ]
      },
      {
        title: "🔮 NASIB & REZEKI",
        rows: [
          { title: "💰 REZEKI", description: "Ramalan rezeki berdasarkan weton", id: `${prefix}rezeki` },
          { title: "💼 PEKERJAAN", description: "Pekerjaan yang cocok untukmu", id: `${prefix}pekerjaan` },
          { title: "🎲 NASIB", description: "Nasibmu berdasarkan primbon", id: `${prefix}ramalannasib` },
          { title: "🏢 SIFAT USAHA", description: "Cocok bisnis apa kamu?", id: `${prefix}sifatusaha` },
          { title: "🧭 ARAH REZEKI", description: "Arah datangnya rezekimu", id: `${prefix}peruntungan` },
          { title: "⭐ PERUNTUNGAN", description: "Peruntunganmu hari ini", id: `${prefix}peruntungan` },
          { title: "⭐ KEBERUNTUNGAN", description: "Angka keberuntunganmu", id: `${prefix}keberuntungan` }
        ]
      },
      {
        title: "📅 HARI & WETON",
        rows: [
          { title: "✅ HARI BAIK", description: "Cek hari baik berdasarkan weton", id: `${prefix}haribaik` },
          { title: "⚠️ HARI SANGAR", description: "Cek hari sangar/pantang", id: `${prefix}harisangar` },
          { title: "❌ HARI SIAL", description: "Cek hari sial kamu", id: `${prefix}harisial` },
          { title: "🐉 NAGA HARI", description: "Posisi naga hari ini", id: `${prefix}nagahari` },
          { title: "⚖️ WETON", description: "Ramalan berdasarkan weton Jawa", id: `${prefix}weton` },
          { title: "🗓️ MASA SUBUR", description: "Hitung masa subur", id: `${prefix}masasubur` }
        ]
      },
      {
        title: "🌟 PRIMBON LAINNYA",
        rows: [
          { title: "💭 ARTI MIMPI", description: "Arti mimpi kamu semalam", id: `${prefix}artimimpi` },
          { title: "🏷️ ARTI NAMA", description: "Arti nama kamu", id: `${prefix}artinama` },
          { title: "🧠 KARAKTER", description: "Karakter berdasarkan tanggal lahir", id: `${prefix}weton` },
          { title: "🃏 TAROT", description: "Ramalan kartu tarot", id: `${prefix}artitarot` },
          { title: "🏠 FENG SHUI", description: "Ramalan feng shui", id: `${prefix}fengshui` },
          { title: "🎣 MEMANCING", description: "Hari baik untuk memancing", id: `${prefix}memancing` },
          { title: "⚕️ PENYAKIT", description: "Penyakit berdasarkan weton", id: `${prefix}potensipenyakit` },
          { title: "♈ ZODIAK", description: "Ramalan zodiak harian", id: `${prefix}zodiak` },
          { title: "🐮 SHIO", description: "Ramalan shio kamu", id: `${prefix}shio` }
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
          { title: "🔍 STALKER MENU", description: "Fitur stalking media sosial", id: `${prefix}stalkermenu` },
          { title: "🖥️ DATABASE MENU", description: "Fitur manajemen database", id: `${prefix}databasemenu` },
          { title: "📜 CERTIFICATE MENU", description: "Fitur sertifikat sifat", id: `${prefix}warmenu` },
          { title: "💬 QUOTES MENU", description: "Kumpulan kata-kata bijak", id: `${prefix}quotesmenu` }
        ]
      },
      {
        title: "🎮 GAME & FUN",
        rows: [
          { title: "🕹️ GAME MENU", description: "Kumpulan game seru", id: `${prefix}gamemenu` },
          { title: "🥳 FUN MENU", description: "Fitur menyenangkan", id: `${prefix}funmenu` },
          { title: "🕌 ISLAMI MENU", description: "Fitur religi islami", id: `${prefix}islamimenu` }
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
