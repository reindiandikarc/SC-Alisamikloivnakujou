// Plugin: antispam
// Commands: antispam
// FIXED: tambah require('fs'), load db lokal, ganti variabel global → lokal

'use strict'
const fs = require('fs')

const DB_PATH = './database/antispam-groups.json'
function loadDB() {
  try {
    if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '[]')
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
  } catch { return [] }
}
function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

module.exports = {
  command: ['antispam'],
  tags: ['admin'],
  run: async (alya, m, ctx) => {
    const { command, args, prefix, isAdmins, Ryuu, replyalya, replytolak } = ctx

    if (!m.isGroup) return replytolak('❌ Perintah ini hanya bisa digunakan di grup!')
    if (!isAdmins && !Ryuu) return replytolak('❌ Hanya admin yang bisa menggunakan fitur ini!')

    let antiSpamGroups = loadDB()
    const isOn = antiSpamGroups.includes(m.chat)

    if (args[0] === 'on') {
      if (isOn) return replyalya('😏 Anti-Spam sudah *AKTIF* di grup ini.')
      antiSpamGroups.push(m.chat)
      saveDB(antiSpamGroups)
      return replyalya('🔥 *Anti-Spam AKTIF!*\nSiap-siap, tukang spam bakal dipantau ketat 💀')
    }

    if (args[0] === 'off') {
      if (!isOn) return replyalya('🤨 Memang sudah *OFF* kok.')
      saveDB(antiSpamGroups.filter(id => id !== m.chat))
      return replyalya('😴 Anti-Spam *dimatikan*. Tukang spam bisa bernapas lega…')
    }

    replyalya(
      `❓ *Pengaturan Anti Spam*\nStatus: *${isOn ? '🔥 ON' : '😴 OFF'}*\n\n` +
      `• \`${prefix}antispam on\` → Aktifkan deteksi spam\n` +
      `• \`${prefix}antispam off\` → Matikan deteksi spam`
    )
  }
}
