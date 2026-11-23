// Plugin: salamuser
// Toggle fitur "salam siaga" per grup — bot kirim pesan heboh saat user
// yang TERDAFTAR (.daftar) muncul chat lagi setelah diam >= 1 jam di grup itu.

'use strict'

const { loadToggle, saveToggle } = require('../../lib/salamuser')

module.exports = {
  command: ['salamuser'],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const { args, prefix, command, replyalya, replytolak, isAdmins, Ryuu } = ctx

    if (!m.isGroup) return replytolak('❌ Fitur khusus grup!')
    if (!isAdmins && !Ryuu) return replytolak('❌ Hanya admin grup yang bisa menggunakan perintah ini!')

    const arr  = loadToggle('user')
    const id   = m.chat
    const isOn = arr.includes(id)
    const arg  = (args[0] || '').toLowerCase()

    if (!arg) {
      return replyalya(
        `🚨 *SALAM USER*\n\n` +
        `Status sekarang: ${isOn ? '🟢 *AKTIF*' : '🔴 *NONAKTIF*'}\n\n` +
        `${prefix + command} on  — aktifkan\n` +
        `${prefix + command} off — nonaktifkan\n\n` +
        `_Saat aktif, bot akan mengumumkan dengan heboh setiap user terdaftar_\n` +
        `_yang sudah diam >= 1 jam di grup ini, lalu chat lagi._`
      )
    }

    if (arg === 'on') {
      if (isOn) return replyalya('⚠️ Salam User sudah aktif di grup ini!')
      arr.push(id)
      saveToggle('user', arr)
      if (Array.isArray(global.salamuser)) global.salamuser.push(id)
      return replyalya('✅ *Salam User diaktifkan!*\nBot akan siaga mendeteksi user terdaftar yang balik chat setelah lama hilang.')
    }

    if (arg === 'off') {
      if (!isOn) return replyalya('⚠️ Salam User sudah nonaktif di grup ini!')
      const idx = arr.indexOf(id)
      arr.splice(idx, 1)
      saveToggle('user', arr)
      if (Array.isArray(global.salamuser)) {
        const gi = global.salamuser.indexOf(id)
        if (gi !== -1) global.salamuser.splice(gi, 1)
      }
      return replyalya('🔴 *Salam User dinonaktifkan!*\nBot berhenti mengumumkan kehadiran user di grup ini.')
    }

    return replyalya(`❓ Argumen tidak dikenal.\n\n${prefix + command} on\n${prefix + command} off`)
  }
}
