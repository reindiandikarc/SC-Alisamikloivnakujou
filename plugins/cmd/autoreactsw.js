// Plugin: autoreactsw
// Ported from Alya V11 → V20 (Pure Plugin Architecture)
// Commands: autoreactsw
// Fungsi: toggle on/off untuk fitur auto-read + auto-react status WhatsApp
// (status@broadcast). Eksekusi reaksi sesungguhnya ada di alya.js pada
// message handler, yang membaca flag global.db.settings[botNumber].autoreactsw.

module.exports = {
  command: ["autoreactsw"],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const {
      command, args, prefix, botNumber,
      Ryuu,
      reply, replytolak,
      setting,
    } = ctx

    const db = global.db

    if (!Ryuu) return replytolak('Waduh, fitur ini cuma bisa diakses sama Owner aja ya!')

    if (!db.settings) db.settings = {}
    if (!db.settings[botNumber]) db.settings[botNumber] = {}
    if (typeof db.settings[botNumber].autoreactsw === 'undefined') {
      db.settings[botNumber].autoreactsw = false
    }

    const s = db.settings[botNumber]
    const arg = (args[0] || '').toLowerCase()

    if (arg === 'on') {
      if (s.autoreactsw) return reply('Status: Auto Reaction SW sudah aktif sebelumnya.')
      s.autoreactsw = true
      return reply('✅ Berhasil mengaktifkan Auto Status Reaction.')
    } else if (arg === 'off') {
      if (!s.autoreactsw) return reply('Status: Memang sudah mati dari tadi.')
      s.autoreactsw = false
      return reply('❌ Berhasil mematikan Auto Status Reaction.')
    } else {
      const status = s.autoreactsw ? 'AKTIF' : 'NONAKTIF'
      return reply(
        `Saat ini status Auto Reaction SW adalah: *${status}*\n\n` +
        `Ketik:\n` +
        `*${prefix}${command} on* (untuk menyalakan)\n` +
        `*${prefix}${command} off* (untuk mematikan)`
      )
    }
  }
}
