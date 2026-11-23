// Plugin: unwarn
// Fixed for Alya V13 — fs di-require langsung, bukan dari ctx
// Commands: unwarn

const fs = require('fs')

module.exports = {
  command: ["unwarn"],
  tags: ['admin'],
  run: async (alya, m, ctx) => {
    const {
      isAdmins, Ryuu,
      replyalya, replytolak
    } = ctx

    if (!m.isGroup) return replytolak(mess.only.group)
    if (!isAdmins && !Ryuu) return replytolak(mess.only.admin)

    let targetUser = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
    if (!targetUser) return replyalya('📌 Tag atau balas pesan orang yang mau diampuni dosanya.')

    const dbWarnSystem = './database/warn-system.json'
    let warnSystem = {}
    try { warnSystem = JSON.parse(fs.readFileSync(dbWarnSystem, 'utf8')) } catch { warnSystem = {} }

    if (!warnSystem[m.chat] || !warnSystem[m.chat][targetUser]) {
      return replyalya('User ini nggak punya catatan peringatan (0 warn).')
    }

    delete warnSystem[m.chat][targetUser]
    fs.writeFileSync(dbWarnSystem, JSON.stringify(warnSystem, null, 2))
    replyalya(`✅ Peringatan untuk @${targetUser.split('@')[0]} berhasil dihapus!`, [targetUser])
  }
}
