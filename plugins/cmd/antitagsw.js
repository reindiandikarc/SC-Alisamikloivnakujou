// Plugin: antitagsw
// Commands: antitagsw
// FIXED: tambah require('fs'), load db lokal, hapus kode broadcast yang nyasar

'use strict'
const fs = require('fs')

const DB_PATH = './database/antitagsw.json'
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
  command: ['antitagsw'],
  tags: ['admin'],
  run: async (alya, m, ctx) => {
    const { command, args, prefix, isGroupAdmins, Ryuu, replyalya, replytolak } = ctx

    if (!m.isGroup) return replytolak('❌ Perintah ini hanya bisa digunakan di grup!')
    if (!isGroupAdmins && !Ryuu) return replytolak('❌ Hanya *admin grup* yang dapat mengatur fitur ini.')

    let antitagsw = loadDB()
    const isOn = antitagsw.includes(m.chat)

    if (args[0] === 'on') {
      if (isOn) return replyalya('✅ Fitur *Anti Tag Status* sudah aktif di grup ini.')
      antitagsw.push(m.chat)
      saveDB(antitagsw)
      replyalya('✅ Fitur *Anti Tag Status* berhasil *diaktifkan*.')
    } else if (args[0] === 'off') {
      if (!isOn) return replyalya('❌ Fitur *Anti Tag Status* belum aktif.')
      saveDB(antitagsw.filter(id => id !== m.chat))
      replyalya('✅ Fitur *Anti Tag Status* berhasil *dinonaktifkan*.')
    } else {
      replyalya(`⚙️ *Pengaturan Anti Tag Status (Story)*\nStatus: *${isOn ? '🟢 ON' : '🔴 OFF'}*\n\nGunakan:\n• *${prefix}antitagsw on*\n• *${prefix}antitagsw off*`)
    }
  }
}
