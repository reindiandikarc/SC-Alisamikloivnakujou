// Plugin: setwelcome
// Commands: setwelcome

const fs = require('fs')

module.exports = {
  command: ["setwelcome"],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const {
      command, prefix, text,
      isAdmins, Ryuu,
      reply, replytolak
    } = ctx

    if (!m.isGroup) return replytolak('Fitur Khusus Group!')
    if (!Ryuu && !isAdmins) return reply('Fitur Khusus admin!')

    if (!text) return reply(
      `╭─「 *SET WELCOME* 」\n` +
      `│\n` +
      `│ Gunakan: *${prefix+command} <teks>*\n` +
      `│\n` +
      `│ 📌 *Variabel tersedia:*\n` +
      `│  @user  → mention member baru\n` +
      `│  @group → nama grup\n` +
      `│  @desc  → deskripsi grup\n` +
      `│\n` +
      `│ 📝 *Contoh:*\n` +
      `│  Hai @user! 👋 Selamat datang\n` +
      `│  di grup *@group*!\n` +
      `│\n` +
      `│ Hapus custom: .delsetwelcome\n` +
      `╰─────────────────`
    )

    const dbPath = './database/set_welcome.json'
    let db = []
    try { db = JSON.parse(fs.readFileSync(dbPath)) } catch (_) { db = [] }

    const idx = db.findIndex(x => x.id === m.chat)
    if (idx !== -1) {
      db[idx].text = text
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 3))
      reply(
        `✅ *Berhasil update format welcome!*\n\n` +
        `*Preview:*\n${text
          .replace(/@user/gi, '@contoh123')
          .replace(/@group/gi, m.chat.split('@')[0])
          .replace(/@desc/gi, 'Deskripsi grup')}`
      )
    } else {
      db.push({ id: m.chat, text })
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 3))
      reply(
        `✅ *Berhasil set welcome!*\n\n` +
        `*Preview:*\n${text
          .replace(/@user/gi, '@contoh123')
          .replace(/@group/gi, m.chat.split('@')[0])
          .replace(/@desc/gi, 'Deskripsi grup')}`
      )
    }
  }
}
