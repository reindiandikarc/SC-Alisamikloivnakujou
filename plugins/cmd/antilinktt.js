// Plugin: antilinktt
// Commands: antilinktt
// FIXED: plugin toggle untuk Anti Link TikTok

'use strict'
const fs = require('fs')

const DB_PATH = './database/antilinktiktok.json'
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
  command: ['antilinktt', 'antilinktiktok'],
  tags: ['admin'],
  run: async (alya, m, ctx) => {
    const { command, args, prefix, isBotAdmins, isAdmins, Ryuu, reply, replyalya, replytolak } = ctx

    if (!m.isGroup) return replytolak('❌ Perintah ini hanya bisa digunakan di grup!')
    if (!isBotAdmins) return replytolak('_Bot Harus Menjadi Admin Terlebih Dahulu_')
    if (!isAdmins && !Ryuu) return reply('Khusus Admin!!')

    let ntilinktt = loadDB()
    const isOn = ntilinktt.includes(m.chat)

    if (args[0] === 'on') {
      if (isOn) return replyalya('✅ Anti Link TikTok sudah aktif di grup ini.')
      ntilinktt.push(m.chat)
      saveDB(ntilinktt)
      replyalya('✅ *Anti Link TikTok* berhasil diaktifkan!\nLink TikTok akan otomatis dihapus.')
    } else if (args[0] === 'off') {
      if (!isOn) return replyalya('❌ Anti Link TikTok memang sudah nonaktif.')
      saveDB(ntilinktt.filter(id => id !== m.chat))
      replyalya('🔴 *Anti Link TikTok* berhasil dinonaktifkan.')
    } else {
      replyalya(`⚙️ *Pengaturan Anti Link TikTok*\nStatus: *${isOn ? '🟢 ON' : '🔴 OFF'}*\n\nGunakan:\n• *${prefix}antilinktt on*\n• *${prefix}antilinktt off*`)
    }
  }
}
