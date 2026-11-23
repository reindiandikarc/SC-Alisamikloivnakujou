// Plugin: setleft
// Commands: setleft

const fs = require('fs')

module.exports = {
  command: ["setleft"],
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
      `╭─「 *SET LEFT* 」\n` +
      `│\n` +
      `│ Gunakan: *${prefix+command} <teks>*\n` +
      `│\n` +
      `│ 📌 *Variabel tersedia:*\n` +
      `│  @user  → mention member keluar\n` +
      `│  @group → nama grup\n` +
      `│  @desc  → deskripsi grup\n` +
      `│\n` +
      `│ 📝 *Contoh:*\n` +
      `│  Bye @user 👋\n` +
      `│  Makasih pernah di *@group*\n` +
      `│\n` +
      `│ Hapus custom: .delsetleft\n` +
      `╰─────────────────`
    )

    const dbPath = './database/set_left.json'
    let db = []
    try { db = JSON.parse(fs.readFileSync(dbPath)) } catch (_) { db = [] }

    const idx = db.findIndex(x => x.id === m.chat)
    if (idx !== -1) {
      db[idx].text = text
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 3))
      reply(
        `✅ *Berhasil update format left!*\n\n` +
        `*Preview:*\n${text
          .replace(/@user/gi, '@contoh123')
          .replace(/@group/gi, m.chat.split('@')[0])
          .replace(/@desc/gi, 'Deskripsi grup')}`
      )
    } else {
      db.push({ id: m.chat, text })
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 3))
      reply(
        `✅ *Berhasil set left!*\n\n` +
        `*Preview:*\n${text
          .replace(/@user/gi, '@contoh123')
          .replace(/@group/gi, m.chat.split('@')[0])
          .replace(/@desc/gi, 'Deskripsi grup')}`
      )
    }
  }
}
