// Plugin: antilinkfb
// Commands: antilinkfb
// FIXED: plugin toggle untuk Anti Link Facebook

'use strict'
const fs = require('fs')

const DB_PATH = './database/antilinkfacebook.json'
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
  command: ['antilinkfb', 'antilinkfacebook'],
  tags: ['admin'],
  run: async (alya, m, ctx) => {
    const { command, args, prefix, isBotAdmins, isAdmins, Ryuu, reply, replyalya, replytolak } = ctx

    if (!m.isGroup) return replytolak('❌ Perintah ini hanya bisa digunakan di grup!')
    if (!isBotAdmins) return replytolak('_Bot Harus Menjadi Admin Terlebih Dahulu_')
    if (!isAdmins && !Ryuu) return reply('Khusus Admin!!')

    let ntilinkfb = loadDB()
    const isOn = ntilinkfb.includes(m.chat)

    if (args[0] === 'on') {
      if (isOn) return replyalya('✅ Anti Link Facebook sudah aktif di grup ini.')
      ntilinkfb.push(m.chat)
      saveDB(ntilinkfb)
      replyalya('✅ *Anti Link Facebook* berhasil diaktifkan!\nLink Facebook akan otomatis dihapus.')
    } else if (args[0] === 'off') {
      if (!isOn) return replyalya('❌ Anti Link Facebook memang sudah nonaktif.')
      saveDB(ntilinkfb.filter(id => id !== m.chat))
      replyalya('🔴 *Anti Link Facebook* berhasil dinonaktifkan.')
    } else {
      replyalya(`⚙️ *Pengaturan Anti Link Facebook*\nStatus: *${isOn ? '🟢 ON' : '🔴 OFF'}*\n\nGunakan:\n• *${prefix}antilinkfb on*\n• *${prefix}antilinkfb off*`)
    }
  }
}
