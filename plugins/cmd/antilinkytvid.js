// Plugin: antilinkytvid
// Ported from Alya V12
// Commands: antilinkytvid, antilinkyoutubevid, antilinkyoutubevideo, antilinkytvideo, antilinkytv

'use strict'
const fs = require('fs')

const DB_PATH = './database/antilinkytvideo.json'
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
  command: ['antilinkytvid', 'antilinkyoutubevid', 'antilinkyoutubevideo', 'antilinkytvideo', 'antilinkytv'],
  tags: ['admin'],
  run: async (alya, m, ctx) => {
    const { command, args, prefix, isBotAdmins, isAdmins, Ryuu, reply, replyalya, replytolak } = ctx

    if (!m.isGroup) return replytolak('❌ Perintah ini hanya bisa digunakan di grup!')
    if (!isBotAdmins) return replytolak('_Bot Harus Menjadi Admin Terlebih Dahulu_')
    if (!isAdmins && !Ryuu) return reply('Khusus Admin!!')

    const db = loadDB()
    const isOn = db.includes(m.chat)

    if (args[0] === 'on') {
      if (isOn) return replyalya('✅ Anti Link YT Video sudah aktif di grup ini.')
      db.push(m.chat)
      saveDB(db)
      replyalya('✅ *Anti Link YouTube Video* berhasil diaktifkan!')
      try {
        const groupe = await alya.groupMetadata(m.chat)
        const mems = groupe.participants.map(a => a.id.replace('c.us', 's.whatsapp.net'))
        alya.sendMessage(m.chat, { text: '```「 ⚠️Warning⚠️ 」```\n\nIf you\'re not an admin, don\'t send the youtube video link in this group or u will be kicked immediately!', contextInfo: { mentionedJid: mems } }, { quoted: m })
      } catch {}
    } else if (args[0] === 'off') {
      if (!isOn) return replyalya('❌ Anti Link YT Video memang sudah nonaktif.')
      saveDB(db.filter(id => id !== m.chat))
      replyalya('🔴 *Anti Link YouTube Video* berhasil dinonaktifkan.')
    } else {
      replyalya(`⚙️ *Pengaturan Anti Link YouTube Video*\nStatus: *${isOn ? '🟢 ON' : '🔴 OFF'}*\n\nGunakan:\n• *${prefix}${command} on*\n• *${prefix}${command} off*`)
    }
  }
}
