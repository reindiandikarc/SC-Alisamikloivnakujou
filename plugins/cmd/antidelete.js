// Plugin: antidelete
// Ported from Alya V10 → V13 Plugin System
// Commands: antidelete
// FIX: path require lib/antidelete diperbaiki dari './lib/antidelete' ke '../../lib/antidelete'
// (plugin berada di plugins/cmd/, lib berada di root lib/)
// FIX: isGroupAdmins → isAdmins (sesuai ctx Alya V13)

'use strict'
const path = require('path')

module.exports = {
  command: ['antidelete'],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const {
      text, prefix, command,
      isGroup, isAdmins, isGroupAdmins, Ryuu,
      replyalya, replytolak
    } = ctx

    if (!isGroup) return replytolak('❌ Fitur ini hanya tersedia untuk grup.')

    // Support isAdmins (V13) atau isGroupAdmins (fallback V12)
    const isAdmin = isAdmins || isGroupAdmins || false
    if (!isAdmin && !Ryuu) return replytolak('❌ Akses ditolak. Perintah ini hanya untuk admin grup.')

    // ✅ FIX: path diperbaiki ke root lib/ dari plugins/cmd/
    const antidelete = require(path.join(__dirname, '../../lib/antidelete'))

    if (!text) return replyalya(
      `🛡️ *ANTI DELETE*\n\n` +
      `Fitur ini berfungsi untuk memantau dan menampilkan kembali pesan\n` +
      `yang dihapus oleh anggota grup.\n\n` +
      `• Hanya dapat dikonfigurasi oleh admin grup\n\n` +
      `⚙️ *Penggunaan*\n` +
      `• *${prefix + command} on*\n   Mengaktifkan Anti Delete\n\n` +
      `• *${prefix + command} off*\n   Menonaktifkan Anti Delete`
    )

    const cmd = text.toLowerCase()

    if (cmd === 'on') {
      antidelete.toggle(m.chat, true)
      replyalya(
        `✅ *ANTI DELETE DIAKTIFKAN*\n\n` +
        `Sistem Anti Delete telah berhasil diaktifkan.\n` +
        `Pesan yang dihapus akan tetap terpantau.`
      )
    } else if (cmd === 'off') {
      antidelete.toggle(m.chat, false)
      replyalya(
        `❌ *ANTI DELETE DINONAKTIFKAN*\n\n` +
        `Sistem Anti Delete telah berhasil dinonaktifkan.\n` +
        `Pesan yang dihapus tidak lagi dipantau.`
      )
    } else {
      replyalya(
        `⚠️ *PERINTAH TIDAK VALID*\n\n` +
        `Gunakan perintah berikut:\n` +
        `• ${prefix + command} on\n` +
        `• ${prefix + command} off`
      )
    }
  }
}
