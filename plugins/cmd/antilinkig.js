// Plugin: antilinkig
// Commands: antilinkig
// FIXED: plugin toggle untuk Anti Link Instagram

'use strict'
const fs = require('fs')

const DB_PATH = './database/antilinkinstagram.json'
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
  command: ['antilinkig', 'antilinkinstagram'],
  tags: ['admin'],
  run: async (alya, m, ctx) => {
    const { command, args, prefix, isBotAdmins, isAdmins, Ryuu, reply, replyalya, replytolak } = ctx

    if (!m.isGroup) return replytolak('❌ Perintah ini hanya bisa digunakan di grup!')
    if (!isBotAdmins) return replytolak('_Bot Harus Menjadi Admin Terlebih Dahulu_')
    if (!isAdmins && !Ryuu) return reply('Khusus Admin!!')

    let ntilinkig = loadDB()
    const isOn = ntilinkig.includes(m.chat)

    if (args[0] === 'on') {
      if (isOn) return replyalya('✅ Anti Link Instagram sudah aktif di grup ini.')
      ntilinkig.push(m.chat)
      saveDB(ntilinkig)
      replyalya('✅ *Anti Link Instagram* berhasil diaktifkan!\nLink Instagram akan otomatis dihapus.')
    } else if (args[0] === 'off') {
      if (!isOn) return replyalya('❌ Anti Link Instagram memang sudah nonaktif.')
      saveDB(ntilinkig.filter(id => id !== m.chat))
      replyalya('🔴 *Anti Link Instagram* berhasil dinonaktifkan.')
    } else {
      replyalya(`⚙️ *Pengaturan Anti Link Instagram*\nStatus: *${isOn ? '🟢 ON' : '🔴 OFF'}*\n\nGunakan:\n• *${prefix}antilinkig on*\n• *${prefix}antilinkig off*`)
    }
  }
}
