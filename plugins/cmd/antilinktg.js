// Plugin: antilinktg
// Commands: antilinktg
// FIXED: plugin toggle untuk Anti Link Telegram

'use strict'
const fs = require('fs')

const DB_PATH = './database/antilinktelegram.json'
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
  command: ['antilinktg', 'antilinktelegram'],
  tags: ['admin'],
  run: async (alya, m, ctx) => {
    const { command, args, prefix, isBotAdmins, isAdmins, Ryuu, reply, replyalya, replytolak } = ctx

    if (!m.isGroup) return replytolak('❌ Perintah ini hanya bisa digunakan di grup!')
    if (!isBotAdmins) return replytolak('_Bot Harus Menjadi Admin Terlebih Dahulu_')
    if (!isAdmins && !Ryuu) return reply('Khusus Admin!!')

    let ntilinktg = loadDB()
    const isOn = ntilinktg.includes(m.chat)

    if (args[0] === 'on') {
      if (isOn) return replyalya('✅ Anti Link Telegram sudah aktif di grup ini.')
      ntilinktg.push(m.chat)
      saveDB(ntilinktg)
      replyalya('✅ *Anti Link Telegram* berhasil diaktifkan!\nLink Telegram (t.me) akan otomatis dihapus.')
    } else if (args[0] === 'off') {
      if (!isOn) return replyalya('❌ Anti Link Telegram memang sudah nonaktif.')
      saveDB(ntilinktg.filter(id => id !== m.chat))
      replyalya('🔴 *Anti Link Telegram* berhasil dinonaktifkan.')
    } else {
      replyalya(`⚙️ *Pengaturan Anti Link Telegram*\nStatus: *${isOn ? '🟢 ON' : '🔴 OFF'}*\n\nGunakan:\n• *${prefix}antilinktg on*\n• *${prefix}antilinktg off*`)
    }
  }
}
