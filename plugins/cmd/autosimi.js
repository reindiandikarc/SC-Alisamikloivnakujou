// Plugin: autosimi
// Commands: autosimi
// Toggle auto-simi (auto jawab chat via simi API) per grup
// Switch TERPISAH dari .alisa — pakai database/simi.json sendiri

'use strict'

const fs   = require('fs')
const path = require('path')

const SIMI_DB = path.join(process.cwd(), 'database', 'simi.json')

function loadSimi() {
  try {
    if (!fs.existsSync(SIMI_DB)) { fs.writeFileSync(SIMI_DB, '[]'); return [] }
    return JSON.parse(fs.readFileSync(SIMI_DB, 'utf-8')) || []
  } catch { return [] }
}

function saveSimi(arr) {
  try { fs.writeFileSync(SIMI_DB, JSON.stringify(arr, null, 2)) } catch (e) {
    console.error('[autosimi] gagal simpan:', e.message)
  }
}

module.exports = {
  command: ['autosimi'],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const { args, prefix, command, reply, replyalya, replytolak, isAdmins, Ryuu } = ctx

    if (!m.isGroup) return replytolak('❌ Fitur khusus grup!')
    if (!isAdmins && !Ryuu) return replytolak('❌ Hanya admin grup yang bisa menggunakan perintah ini!')

    const simiArr = loadSimi()
    const id      = m.chat
    const isOn    = simiArr.includes(id)
    const arg     = (args[0] || '').toLowerCase()

    if (!arg) {
      return replyalya(
        `🤖 *AUTO SIMI*\n\n` +
        `Status sekarang: ${isOn ? '🟢 *AKTIF*' : '🔴 *NONAKTIF*'}\n\n` +
        `${prefix + command} on  — aktifkan\n` +
        `${prefix + command} off — nonaktifkan\n\n` +
        `_Switch ini TERPISAH dari .alisa on/off_`
      )
    }

    if (arg === 'on') {
      if (isOn) return replyalya('⚠️ Auto Simi sudah aktif di grup ini!')
      simiArr.push(id)
      saveSimi(simiArr)
      // Sync ke global jika tersedia
      if (Array.isArray(global.siminya)) global.siminya.push(id)
      return replyalya('✅ *Auto Simi diaktifkan!*\nBot akan otomatis membalas setiap pesan di grup ini.')
    }

    if (arg === 'off') {
      if (!isOn) return replyalya('⚠️ Auto Simi sudah nonaktif di grup ini!')
      const idx = simiArr.indexOf(id)
      simiArr.splice(idx, 1)
      saveSimi(simiArr)
      // Sync ke global
      if (Array.isArray(global.siminya)) {
        const gi = global.siminya.indexOf(id)
        if (gi !== -1) global.siminya.splice(gi, 1)
      }
      return replyalya('🔴 *Auto Simi dinonaktifkan!*\nBot tidak akan membalas semua pesan di grup ini lagi.')
    }

    return replyalya(`❓ Argumen tidak dikenal.\n\n${prefix + command} on\n${prefix + command} off`)
  }
}
