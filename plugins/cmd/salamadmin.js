// Plugin: salamadmin
// Toggle fitur "salam siaga khusus admin grup" per grup — bot kirim pesan
// heboh saat salah satu ADMIN GRUP INI (dideteksi real-time dari metadata
// grup, bukan database terpisah) muncul chat lagi setelah diam >= 1 jam.
// Kalau yang chat adalah owner bot DAN kebetulan admin, salamowner yang
// jalan (prioritas), salamadmin tidak dobel-kirim untuk orang yang sama.

'use strict'

const { loadToggle, saveToggle } = require('../../lib/salamuser')

module.exports = {
  command: ['salamadmin'],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const { args, prefix, command, replyalya, replytolak, isAdmins, Ryuu } = ctx

    if (!m.isGroup) return replytolak('❌ Fitur khusus grup!')
    if (!isAdmins && !Ryuu) return replytolak('❌ Hanya admin grup yang bisa menggunakan perintah ini!')

    const arr  = loadToggle('admin')
    const id   = m.chat
    const isOn = arr.includes(id)
    const arg  = (args[0] || '').toLowerCase()

    if (!arg) {
      return replyalya(
        `🚨 *SALAM ADMIN*\n\n` +
        `Status sekarang: ${isOn ? '🟢 *AKTIF*' : '🔴 *NONAKTIF*'}\n\n` +
        `${prefix + command} on  — aktifkan\n` +
        `${prefix + command} off — nonaktifkan\n\n` +
        `_Saat aktif, bot akan mengumumkan dengan riuh setiap admin grup ini_\n` +
        `_yang sudah diam >= 1 jam, lalu chat lagi._\n` +
        `_Owner bot yang kebetulan admin tetap dapat salam owner, bukan ini._`
      )
    }

    if (arg === 'on') {
      if (isOn) return replyalya('⚠️ Salam Admin sudah aktif di grup ini!')
      arr.push(id)
      saveToggle('admin', arr)
      if (Array.isArray(global.salamadmin)) global.salamadmin.push(id)
      return replyalya('✅ *Salam Admin diaktifkan!*\nBot akan siaga saat admin grup ini balik chat setelah lama hilang.')
    }

    if (arg === 'off') {
      if (!isOn) return replyalya('⚠️ Salam Admin sudah nonaktif di grup ini!')
      const idx = arr.indexOf(id)
      arr.splice(idx, 1)
      saveToggle('admin', arr)
      if (Array.isArray(global.salamadmin)) {
        const gi = global.salamadmin.indexOf(id)
        if (gi !== -1) global.salamadmin.splice(gi, 1)
      }
      return replyalya('🔴 *Salam Admin dinonaktifkan!*\nBot berhenti mengumumkan kehadiran admin di grup ini.')
    }

    return replyalya(`❓ Argumen tidak dikenal.\n\n${prefix + command} on\n${prefix + command} off`)
  }
}
