// Plugin: antiwame
// Commands: antiwame
// FIXED: tambah require('fs'), load db lokal, ganti variabel global → lokal

'use strict'
const fs = require('fs')

const DB_PATH = './database/antiwame.json'
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
  command: ['antiwame'],
  tags: ['admin'],
  run: async (alya, m, ctx) => {
    const { command, args, prefix, isBotAdmins, isAdmins, Ryuu, reply, replyalya, replytolak } = ctx

    if (!m.isGroup) return replytolak('❌ Perintah ini hanya bisa digunakan di grup!')
    if (!isBotAdmins) return replytolak('_Bot Harus Menjadi Admin Terlebih Dahulu_')
    if (!isAdmins && !Ryuu) return reply('Khusus Admin!!')

    let ntwame = loadDB()
    const isOn = ntwame.includes(m.chat)

    if (args[0] === 'on') {
      if (isOn) return replyalya('✅ Anti WA.me sudah aktif di grup ini.')
      ntwame.push(m.chat)
      saveDB(ntwame)
      replyalya('✅ *Anti WA.me* berhasil diaktifkan! Link wa.me akan otomatis dihapus.')
      try {
        const groupe = await alya.groupMetadata(m.chat)
        const mems = groupe.participants.map(a => a.id.replace('c.us', 's.whatsapp.net'))
        alya.sendMessage(m.chat, { text: '```「 ⚠️ Warning ⚠️ 」```\n\nDilarang mengirim link wa.me di grup ini!', contextInfo: { mentionedJid: mems } }, { quoted: m })
      } catch {}
    } else if (args[0] === 'off') {
      if (!isOn) return replyalya('❌ Anti WA.me memang sudah nonaktif.')
      saveDB(ntwame.filter(id => id !== m.chat))
      replyalya('🔴 *Anti WA.me* berhasil dinonaktifkan.')
    } else {
      replyalya(`⚙️ *Pengaturan Anti WA.me*\nStatus: *${isOn ? '🟢 ON' : '🔴 OFF'}*\n\nGunakan:\n• *${prefix}antiwame on*\n• *${prefix}antiwame off*`)
    }
  }
}
