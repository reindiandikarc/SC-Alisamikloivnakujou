// Plugin: salamowner
// Toggle fitur "salam siaga khusus owner" per grup — bot kirim pesan heboh
// saat OWNER BOT (terdaftar di database/owner.json) muncul chat lagi
// setelah diam >= 1 jam di grup ini.

'use strict'

const { loadToggle, saveToggle } = require('../../lib/salamuser')

module.exports = {
  command: ['salamowner'],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const { args, prefix, command, replyalya, replytolak, isAdmins, Ryuu } = ctx

    if (!m.isGroup) return replytolak('❌ Fitur khusus grup!')
    if (!isAdmins && !Ryuu) return replytolak('❌ Hanya admin grup yang bisa menggunakan perintah ini!')

    const arr  = loadToggle('owner')
    const id   = m.chat
    const isOn = arr.includes(id)
    const arg  = (args[0] || '').toLowerCase()

    if (!arg) {
      return replyalya(
        `🚨 *SALAM OWNER*\n\n` +
        `Status sekarang: ${isOn ? '🟢 *AKTIF*' : '🔴 *NONAKTIF*'}\n\n` +
        `${prefix + command} on  — aktifkan\n` +
        `${prefix + command} off — nonaktifkan\n\n` +
        `_Saat aktif, bot akan mengumumkan dengan heboh saat OWNER BOT_\n` +
        `_muncul chat lagi setelah diam >= 1 jam di grup ini._`
      )
    }

    if (arg === 'on') {
      if (isOn) return replyalya('⚠️ Salam Owner sudah aktif di grup ini!')
      arr.push(id)
      saveToggle('owner', arr)
      if (Array.isArray(global.salamowner)) global.salamowner.push(id)
      return replyalya('✅ *Salam Owner diaktifkan!*\nBot akan siaga saat owner bot balik chat setelah lama hilang.')
    }

    if (arg === 'off') {
      if (!isOn) return replyalya('⚠️ Salam Owner sudah nonaktif di grup ini!')
      const idx = arr.indexOf(id)
      arr.splice(idx, 1)
      saveToggle('owner', arr)
      if (Array.isArray(global.salamowner)) {
        const gi = global.salamowner.indexOf(id)
        if (gi !== -1) global.salamowner.splice(gi, 1)
      }
      return replyalya('🔴 *Salam Owner dinonaktifkan!*\nBot berhenti mengumumkan kehadiran owner di grup ini.')
    }

    return replyalya(`❓ Argumen tidak dikenal.\n\n${prefix + command} on\n${prefix + command} off`)
  }
}
