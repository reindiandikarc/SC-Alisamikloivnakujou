// Plugin: setlevel
// Ported from Alya V10 → V13 Plugin System
// Commands: setlevel

module.exports = {
  command: ["setlevel"],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const {
      args, prefix, command,
      Ryuu,
      replyalya, replytolak
    } = ctx

    if (!Ryuu) return replytolak(mess.only.owner)

    const roles = [
      { level: 0,   role: "Pemula"   },
      { level: 10,  role: "Novice"   },
      { level: 20,  role: "Advanced" },
      { level: 40,  role: "Expert"   },
      { level: 80,  role: "Master"   },
      { level: 120, role: "Legend"   }
    ]

    const getRole = (level) => {
      let role = "Pemula"
      for (let r of roles) { if (level >= r.level) role = r.role }
      return role
    }

    let target, level

    if (m.quoted) {
      target = m.quoted.sender
      level  = parseInt(args[0])
    } else if (args.length >= 2) {
      target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
      level  = parseInt(args[1])
    } else {
      target = m.sender
      level  = parseInt(args[0])
    }

    if (!target || isNaN(level) || level < 0) return replyalya(
      `Format salah\n\nContoh:\n` +
      `${prefix + command} @user 20\n` +
      `${prefix + command} 628xxxx 30\n` +
      `reply pesan lalu ketik: ${prefix + command} 15`
    )

    if (!(target in global.db.users)) return replyalya('User tidak ditemukan.')

    global.db.users[target].level = level
    global.db.users[target].exp   = 0
    global.db.users[target].role  = getRole(level)

    replyalya(
      `✅ *LEVEL BERHASIL DIUBAH*\n\n` +
      `👤 User : @${target.split('@')[0]}\n` +
      `🎯 Level : ${level}\n` +
      `🏅 Role  : ${global.db.users[target].role}`,
      { mentions: [target] }
    )
  }
}
