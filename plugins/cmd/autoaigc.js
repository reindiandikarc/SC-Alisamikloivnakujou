// Plugin: autoaigc
// Commands: autoaigrup, aigrup, autoaigc
// Toggle auto-AI-reply per grup
// Switch TERPISAH dari .alisa — pakai database/openaigc.json sendiri

'use strict'

const fs   = require('fs')
const path = require('path')

const AIGC_DB = path.join(process.cwd(), 'database', 'openaigc.json')

function loadAigc() {
  try {
    if (!fs.existsSync(AIGC_DB)) { fs.writeFileSync(AIGC_DB, '[]'); return [] }
    return JSON.parse(fs.readFileSync(AIGC_DB, 'utf-8')) || []
  } catch { return [] }
}

function saveAigc(arr) {
  try { fs.writeFileSync(AIGC_DB, JSON.stringify(arr, null, 2)) } catch (e) {
    console.error('[autoaigc] gagal simpan:', e.message)
  }
}

module.exports = {
  command: ['autoaigrup', 'aigrup', 'autoaigc'],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const { args, prefix, command, reply, replyalya, replytolak, isAdmins, Ryuu } = ctx

    if (!m.isGroup) return replytolak('❌ Fitur khusus grup!')
    if (!isAdmins && !Ryuu) return replytolak('❌ Hanya admin grup yang bisa menggunakan perintah ini!')

    const aigcArr = loadAigc()
    const id      = m.chat
    const isOn    = aigcArr.includes(id)
    const arg     = (args[0] || '').toLowerCase()

    if (!arg) {
      return replyalya(
        `🤖 *AUTO AI GRUP*\n\n` +
        `Status sekarang: ${isOn ? '🟢 *AKTIF*' : '🔴 *NONAKTIF*'}\n\n` +
        `${prefix + command} on  — aktifkan\n` +
        `${prefix + command} off — nonaktifkan\n\n` +
        `_Switch ini TERPISAH dari .alisa on/off_\n` +
        `_Untuk matikan AI global, gunakan .alisa off-all_`
      )
    }

    if (arg === 'on') {
      if (isOn) return replyalya('⚠️ Auto AI Grup sudah aktif di grup ini!')
      aigcArr.push(id)
      saveAigc(aigcArr)
      // Sync ke global jika tersedia
      if (Array.isArray(global.openaigc)) global.openaigc.push(id)
      return replyalya('✅ *Auto AI Grup diaktifkan!*\nBot akan merespons semua chat di grup ini dengan AI.')
    }

    if (arg === 'off') {
      if (!isOn) return replyalya('⚠️ Auto AI Grup sudah nonaktif di grup ini!')
      const idx = aigcArr.indexOf(id)
      aigcArr.splice(idx, 1)
      saveAigc(aigcArr)
      // Sync ke global
      if (Array.isArray(global.openaigc)) {
        const gi = global.openaigc.indexOf(id)
        if (gi !== -1) global.openaigc.splice(gi, 1)
      }
      return replyalya('🔴 *Auto AI Grup dinonaktifkan!*\nBot tidak akan membalas semua pesan di grup ini dengan AI.')
    }

    return replyalya(`❓ Argumen tidak dikenal.\n\n${prefix + command} on\n${prefix + command} off`)
  }
}
