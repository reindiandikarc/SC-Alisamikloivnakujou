// Plugin: antilinktwt
// Commands: antilinktwt
// FIXED: plugin toggle untuk Anti Link Twitter/X

'use strict'
const fs = require('fs')

const DB_PATH = './database/antilinktwitter.json'
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
  command: ['antilinktwt', 'antilinktwitter'],
  tags: ['admin'],
  run: async (alya, m, ctx) => {
    const { command, args, prefix, isBotAdmins, isAdmins, Ryuu, reply, replyalya, replytolak } = ctx

    if (!m.isGroup) return replytolak('❌ Perintah ini hanya bisa digunakan di grup!')
    if (!isBotAdmins) return replytolak('_Bot Harus Menjadi Admin Terlebih Dahulu_')
    if (!isAdmins && !Ryuu) return reply('Khusus Admin!!')

    let ntilinktwt = loadDB()
    const isOn = ntilinktwt.includes(m.chat)

    if (args[0] === 'on') {
      if (isOn) return replyalya('✅ Anti Link Twitter/X sudah aktif di grup ini.')
      ntilinktwt.push(m.chat)
      saveDB(ntilinktwt)
      replyalya('✅ *Anti Link Twitter/X* berhasil diaktifkan!\nLink Twitter/X akan otomatis dihapus.')
    } else if (args[0] === 'off') {
      if (!isOn) return replyalya('❌ Anti Link Twitter/X memang sudah nonaktif.')
      saveDB(ntilinktwt.filter(id => id !== m.chat))
      replyalya('🔴 *Anti Link Twitter/X* berhasil dinonaktifkan.')
    } else {
      replyalya(`⚙️ *Pengaturan Anti Link Twitter/X*\nStatus: *${isOn ? '🟢 ON' : '🔴 OFF'}*\n\nGunakan:\n• *${prefix}antilinktwt on*\n• *${prefix}antilinktwt off*`)
    }
  }
}
