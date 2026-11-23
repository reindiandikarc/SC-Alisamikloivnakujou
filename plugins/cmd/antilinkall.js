// Plugin: antilinkall
// Commands: antilinkall
// FIXED: tambah require('fs'), load db lokal, ganti variabel global → lokal

'use strict'
const fs = require('fs')

const DB_PATH = './database/antilinkall.json'
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
  command: ['antilinkall'],
  tags: ['admin'],
  run: async (alya, m, ctx) => {
    const { command, args, prefix, isBotAdmins, isAdmins, Ryuu, reply, replyalya, replytolak } = ctx

    if (!m.isGroup) return replytolak('❌ Perintah ini hanya bisa digunakan di grup!')
    if (!isBotAdmins) return replytolak('_Bot Harus Menjadi Admin Terlebih Dahulu_')
    if (!isAdmins && !Ryuu) return reply('Khusus Admin!!')

    let ntilinkall = loadDB()
    const isOn = ntilinkall.includes(m.chat)

    if (args[0] === 'on') {
      if (isOn) return replyalya('✅ Anti Link All sudah aktif di grup ini.')
      ntilinkall.push(m.chat)
      saveDB(ntilinkall)
      replyalya('✅ *Anti Link All* berhasil diaktifkan! Semua link akan otomatis dihapus.')
      try {
        const groupe = await alya.groupMetadata(m.chat)
        const mems = groupe.participants.map(a => a.id.replace('c.us', 's.whatsapp.net'))
        alya.sendMessage(m.chat, { text: '```「 ⚠️ Warning ⚠️ 」```\n\nAnti Link ALL aktif! Dilarang kirim link apapun di grup ini!', contextInfo: { mentionedJid: mems } }, { quoted: m })
      } catch {}
    } else if (args[0] === 'off') {
      if (!isOn) return replyalya('❌ Anti Link All memang sudah nonaktif.')
      saveDB(ntilinkall.filter(id => id !== m.chat))
      replyalya('🔴 *Anti Link All* berhasil dinonaktifkan.')
    } else {
      replyalya(`⚙️ *Pengaturan Anti Link All*\nStatus: *${isOn ? '🟢 ON' : '🔴 OFF'}*\n\nGunakan:\n• *${prefix}antilinkall on*\n• *${prefix}antilinkall off*`)
    }
  }
}
