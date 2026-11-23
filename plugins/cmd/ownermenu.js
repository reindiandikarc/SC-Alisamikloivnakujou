// Plugin: ownermenu
// Fixed for Alya V13 — ditambah redeem, setlevel, clearchat
// Commands: ownermenu

module.exports = {
  command: ["ownermenu"],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const {
      prefix,
      Ryuu,
      replyalya, replytolak,
      listbut2, listbut3
    } = ctx

    if (!Ryuu) return replytolak(mess.only.owner)

    let AlyaSad = `╭═══ • 🌐 *OWNER ONLY* 🌐 • ═══╮
┃
┣⊱ 📖 *${prefix}autoread*
┣⊱ 🎫 *${prefix}addsewa*
┣⊱ ➕ *${prefix}tambahsewa*
┣⊱ ➖ *${prefix}kurangisewa*
┣⊱ 🗑️ *${prefix}delsewa*
┣⊱ 📱 *${prefix}onlypc*
┣⊱ 👥 *${prefix}onlygc*
┣⊱ 👤 *${prefix}self*
┣⊱ 🧹 *${prefix}clearchat*
┣⊱ 📌 *${prefix}pinchat*
┣⊱ 📍 *${prefix}unpinchat*
┣⊱ 🏘️ *${prefix}gconly*
┣⊱ 🔓 *${prefix}public*
┣⊱ 🛠️ *${prefix}addcase*
┣⊱ 📥 *${prefix}join*
┣⊱ 📢 *${prefix}bctext*
┣⊱ 📊 *${prefix}poll*
┣⊱ 🖼️ *${prefix}bcimage*
┣⊱ 🎥 *${prefix}bcvideo*
┣⊱ 🏗️ *${prefix}creategc*
┣⊱ 🏷️ *${prefix}setexif*
┣⊱ 🆔 *${prefix}userjid*
┣⊱ 🤖 *${prefix}setbotname*
┣⊱ 📝 *${prefix}setbotbio*
┣⊱ 🖼️ *${prefix}delppbot*
┣⊱ 🔄 *${prefix}restart*
┣⊱ 🖼️ *${prefix}setppbot*
┣⊱ 💎 *${prefix}addprem*
┣⊱ 🗑️ *${prefix}delprem*
┣⊱ 👑 *${prefix}addowner*
┣⊱ 🗑️ *${prefix}delowner*
┣⊱ 🎤 *${prefix}addvn*
┣⊱ 🗑️ *${prefix}delvn*
┣⊱ 📁 *${prefix}addsticker*
┣⊱ 🗑️ *${prefix}delsticker*
┣⊱ 🖼️ *${prefix}addimage*
┣⊱ 🗑️ *${prefix}delimage*
┣⊱ 🎥 *${prefix}addvideo*
┣⊱ 🗑️ *${prefix}delvideo*
┣⊱ 🚫 *${prefix}block*
┣⊱ 🔓 *${prefix}unblock*
┣⊱ 🚪 *${prefix}leavegc*
┣⊱ 📊 *${prefix}setlimit*
┣⊱ 💸 *${prefix}setmoney*
┣⊱ 🆙 *${prefix}setlevel*
┣⊱ 🏦 *${prefix}setbank*
┣⊱ 🔨 *${prefix}ban*
┣⊱ 🔓 *${prefix}unban*
┣⊱ ⚠️ *${prefix}warn*
┣⊱ ✅ *${prefix}unwarn*
┣⊱ 🎟 *${prefix}addredeem*
┣⊱ 🗑️ *${prefix}delredeem*
┣⊱ 📜 *${prefix}listredeem*
┃
╰══════════════════════════╯`

    const sections = [
      {
        title: "⚙️ MODE BOT",
        rows: [
          { title: "📖 Auto Read",  description: "Aktifkan/nonaktifkan auto read pesan", id: `${prefix}autoread` },
          { title: "📱 Only PC",    description: "Bot hanya merespons di chat pribadi",   id: `${prefix}onlypc`   },
          { title: "👥 Only GC",    description: "Bot hanya merespons di grup",           id: `${prefix}onlygc`   },
          { title: "👤 Self",       description: "Mode self (hanya bot sendiri)",          id: `${prefix}self`     },
          { title: "🌐 GC Only",    description: "Aktifkan mode GC only",                 id: `${prefix}gconly`   },
          { title: "🔓 Public",     description: "Mode publik (semua bisa pakai)",         id: `${prefix}public`   },
        ]
      },
      {
        title: "🤖 PROFIL BOT",
        rows: [
          { title: "🤖 Set Bot Name",      description: "Ubah nama bot",                     id: `${prefix}setbotname`    },
          { title: "📝 Set Bot Bio",        description: "Ubah bio bot",                       id: `${prefix}setbotbio`     },
          { title: "🖼️ Set PP Bot",         description: "Ganti foto profil bot",              id: `${prefix}setppbot`      },
          { title: "🖼️ Set PP Panjang",     description: "Set profile picture panjang",        id: `${prefix}setpppanjang`  },
          { title: "🖼️ Set PP GC Panjang",  description: "Set foto profil grup panjang",       id: `${prefix}setppgcpanjang`},
          { title: "❌ Del PP Bot",          description: "Hapus foto profil bot",              id: `${prefix}delppbot`      },
          { title: "⚙️ Set Exif",           description: "Atur exif sticker (packname|author)", id: `${prefix}setexif`      },
        ]
      },
      {
        title: "💎 MANAJEMEN USER",
        rows: [
          { title: "💎 Add Prem",   description: "Tambah user premium",    id: `${prefix}addprem`  },
          { title: "❌ Del Prem",   description: "Hapus user premium",     id: `${prefix}delprem`  },
          { title: "👑 Add Owner",  description: "Tambah owner bot",       id: `${prefix}addowner` },
          { title: "❌ Del Owner",  description: "Hapus owner bot",        id: `${prefix}delowner` },
          { title: "🚫 Block",      description: "Blokir user",            id: `${prefix}block`    },
          { title: "✅ Unblock",    description: "Buka blokir user",       id: `${prefix}unblock`  },
          { title: "📊 Set Limit",  description: "Set limit user",         id: `${prefix}setlimit` },
          { title: "💸 Set Money",  description: "Set uang user",          id: `${prefix}setmoney` },
          { title: "🆙 Set Level",  description: "Set level user",         id: `${prefix}setlevel` },
          { title: "🏦 Set Bank",   description: "Set bank user",          id: `${prefix}setbank`  },
          { title: "🔨 Ban",        description: "Ban user dari bot",      id: `${prefix}ban`      },
          { title: "✅ Unban",      description: "Unban user",             id: `${prefix}unban`    },
          { title: "⚠️ Warn",       description: "Beri peringatan member", id: `${prefix}warn`     },
          { title: "✅ Unwarn",     description: "Hapus peringatan member",id: `${prefix}unwarn`   },
        ]
      },
      {
        title: "🎟 REDEEM",
        rows: [
          { title: "🎟 Add Redeem",  description: "Buat kode redeem baru",     id: `${prefix}addredeem`  },
          { title: "🗑️ Del Redeem",  description: "Hapus kode redeem",          id: `${prefix}delredeem`  },
          { title: "📜 List Redeem", description: "Lihat semua kode redeem",    id: `${prefix}listredeem` },
        ]
      },
      {
        title: "📡 MANAJEMEN GRUP",
        rows: [
          { title: "➕ Add Sewa",  description: "Tambahkan sewa bot ke grup",   id: `${prefix}addsewa`  },
          { title: "🔼 Tambah Sewa", description: "Tambah/perpanjang durasi sewa grup", id: `${prefix}tambahsewa` },
          { title: "🔽 Kurangi Sewa", description: "Kurangi durasi sewa grup",   id: `${prefix}kurangisewa` },
          { title: "❌ Del Sewa",  description: "Hapus sewa bot dari grup",     id: `${prefix}delsewa`  },
          { title: "🔗 Join",      description: "Bot join grup via link invite", id: `${prefix}join`     },
          { title: "🏗️ Create GC", description: "Buat grup baru",               id: `${prefix}creategc` },
          { title: "🚪 Leave GC",  description: "Bot keluar dari grup",          id: `${prefix}leavegc`  },
          { title: "📌 Pin Chat",  description: "Sematkan chat",                 id: `${prefix}pinchat`  },
          { title: "📍 Unpin Chat",description: "Lepas pin chat",                id: `${prefix}unpinchat`},
        ]
      },
      {
        title: "📢 BROADCAST",
        rows: [
          { title: "📢 BC Text",  description: "Broadcast teks ke semua chat",  id: `${prefix}bctext`  },
          { title: "🖼️ BC Image", description: "Broadcast gambar ke semua chat", id: `${prefix}bcimage` },
          { title: "🎥 BC Video", description: "Broadcast video ke semua chat",  id: `${prefix}bcvideo` },
          { title: "📊 Poll",     description: "Buat poll/voting",               id: `${prefix}poll`    },
        ]
      },
      {
        title: "🎙️ MEDIA CUSTOM",
        rows: [
          { title: "🎙️ Add VN",     description: "Tambah voice note custom",  id: `${prefix}addvn`      },
          { title: "❌ Del VN",     description: "Hapus voice note custom",    id: `${prefix}delvn`      },
          { title: "📁 Add Sticker",description: "Tambah stiker custom",       id: `${prefix}addsticker` },
          { title: "❌ Del Sticker",description: "Hapus stiker custom",        id: `${prefix}delsticker` },
          { title: "🖼️ Add Image",  description: "Tambah gambar custom",       id: `${prefix}addimage`   },
          { title: "❌ Del Image",  description: "Hapus gambar custom",        id: `${prefix}delimage`   },
          { title: "🎥 Add Video",  description: "Tambah video custom",        id: `${prefix}addvideo`   },
          { title: "❌ Del Video",  description: "Hapus video custom",         id: `${prefix}delvideo`   },
        ]
      },
      {
        title: "🔧 LAIN-LAIN",
        rows: [
          { title: "📝 Add Case",  description: "Tambah case/command baru",  id: `${prefix}addcase`  },
          { title: "🆔 User JID",  description: "Lihat JID user",            id: `${prefix}userjid`  },
          { title: "🧹 Clear Chat",description: "Hapus riwayat chat bot",    id: `${prefix}clearchat`},
          { title: "🔄 Restart",   description: "Restart bot",               id: `${prefix}restart`  },
          { title: "📜 Script",    description: "Info script bot",           id: `${prefix}script`   },
          { title: "⭐ Rating",    description: "Rating bot",                id: `${prefix}rating`   },
          { title: "ℹ️ Info Bot",  description: "Informasi bot",             id: `${prefix}infobot`  },
        ]
      }
    ]

    const listnye = {
      title: "👑 PILIH PERINTAH OWNER",
      sections: sections
    }

    await listbut3(m.chat, AlyaSad, listnye, m)
  }
}
