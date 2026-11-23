// Plugin: antinsfw
// Ported from Alya V12 alya.js
// Commands: antinsfw

const fs = require('fs')
const path = require('path')

const DB_PATH = './database/antinsfw.json'

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
  command: ['antinsfw'],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix,
      isGroup, isGroupAdmins, isBotAdmins, Ryuu,
      reply, replyalya, replytolak
    } = ctx

    if (!isGroup) return reply('❌ Fitur ini hanya untuk grup!')
    if (!(isGroupAdmins || Ryuu)) return reply('❌ Hanya admin/owner yang bisa mengubah pengaturan.')

    let antiNSFWGroups = loadDB()

    if (args[0] === 'on') {
      if (!antiNSFWGroups.includes(m.chat)) {
        antiNSFWGroups.push(m.chat)
        saveDB(antiNSFWGroups)
      }
      return reply('✅ Anti-NSFW stiker diaktifkan untuk grup ini.')
    } else if (args[0] === 'off') {
      antiNSFWGroups = antiNSFWGroups.filter(id => id !== m.chat)
      saveDB(antiNSFWGroups)
      return reply('❌ Anti-NSFW stiker dimatikan untuk grup ini.')
    } else {
      const isOn = antiNSFWGroups.includes(m.chat)
      return replyalya(
        `🛡️ *Anti NSFW Stiker*\n\n` +
        `Status saat ini: *${isOn ? '🟢 ON' : '🔴 OFF'}*\n\n` +
        `Gunakan:\n` +
        `• *${prefix}antinsfw on* — Aktifkan\n` +
        `• *${prefix}antinsfw off* — Nonaktifkan\n\n` +
        `_Anti NSFW akan menghapus stiker berkonten 18+ secara otomatis_`
      )
    }
  }
}
