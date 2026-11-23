// ============================================================
// Plugin: .antitoxic — Filter kata kasar di grup
// Commands: antitoxic, addbadword, delbadword, listbadword
// Fix:
//   - Toggle ON/OFF sync ke `nttoxic` array global di alya.js
//     (array yang dibaca oleh logika deteksi di alya.js)
//   - Manage kata kasar (`badwords`) juga via ctx (global array)
//   - Warning system via `userWarnings` global di alya.js
//   - saveAntiToxic() sync ke disk agar persist restart
// ============================================================

module.exports = {
  command: ['antitoxic', 'addbadword', 'delbadword', 'listbadword'],
  tags: ['admin'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, prefix, from,
      isGroup, sender, pushname,
      isBotAdmins, isAdmins, isAdminOrOwner, Ryuu,
      reply, replyalya, replytolak,
      // State global antitoxic (di-pass dari alya.js via ctx)
      nttoxic, badwords, saveAntiToxic, userWarnings,
    } = ctx

    if (!isGroup) return replytolak('❌ Perintah ini hanya untuk grup!')

    const isAktif = nttoxic.includes(from)

    // ============================================================
    // .antitoxic — Toggle + status + warning reset
    // ============================================================
    if (command === 'antitoxic') {
      if (!isAdminOrOwner) return replytolak('❌ Hanya admin/owner yang bisa menggunakan fitur ini!')

      const sub = (args[0] || '').toLowerCase()

      if (!sub) {
        // Hitung total warning semua member di grup ini (dari userWarnings in-memory)
        const totalWarn = Object.keys(userWarnings).reduce((acc, uid) => {
          if (uid.includes(from.split('@')[0])) return acc // skip non-grup
          return acc + (userWarnings[uid] || 0)
        }, 0)

        return replyalya(
          `☣️━〔 *ANTITOXIC SYSTEM* 〕━☣️\n\n` +
          `📊 *Status Sistem*\n` +
          `• Proteksi  : *${isAktif ? '✅ AKTIF (ON)' : '❌ NONAKTIF (OFF)'}*\n` +
          `• Kata kasar: *${Array.isArray(badwords) ? badwords.length : 0} kata*\n` +
          `• Batas warn: *5x → kick*\n\n` +
          `⚙️ *Pengaturan:*\n` +
          `• \`${prefix}antitoxic on\`       — Aktifkan filter\n` +
          `• \`${prefix}antitoxic off\`      — Matikan filter\n` +
          `• \`${prefix}antitoxic reset\`    — Reset semua warning\n\n` +
          `📝 *Manajemen Kata Kasar:*\n` +
          `• \`${prefix}addbadword [kata]\`  — Tambah kata\n` +
          `• \`${prefix}delbadword [kata]\`  — Hapus kata\n` +
          `• \`${prefix}listbadword\`        — Lihat semua kata\n\n` +
          `💡 _Bot harus jadi admin agar bisa kick & hapus pesan._`
        )
      }

      switch (sub) {
        case 'on': {
          if (isAktif) return replyalya('🟢 AntiToxic sudah aktif di grup ini.')
          nttoxic.push(from)
          saveAntiToxic()
          await alya.sendMessage(m.chat, { react: { text: '☣️', key: m.key } })
          return replyalya(
            `✅ *AntiToxic berhasil diaktifkan!*\n\n` +
            `• Kata kasar terdaftar: *${Array.isArray(badwords) ? badwords.length : 0} kata*\n` +
            `• Batas peringatan    : *5x → kick*\n` +
            `• Bot admin           : *${isBotAdmins ? 'Ya ✅' : 'Tidak ❌ (kick & delete tidak bisa)'}*\n\n` +
            `_Setiap kata kasar akan otomatis dihapus dan user diperingatkan._`
          )
        }

        case 'off': {
          if (!isAktif) return replyalya('🔴 AntiToxic sudah nonaktif di grup ini.')
          const idx = nttoxic.indexOf(from)
          if (idx !== -1) nttoxic.splice(idx, 1)
          saveAntiToxic()
          await alya.sendMessage(m.chat, { react: { text: '🔓', key: m.key } })
          return replyalya('🔴 *AntiToxic dinonaktifkan.*\n_Filter kata kasar tidak lagi aktif di grup ini._')
        }

        case 'reset': {
          // Reset semua warning untuk grup ini — hapus semua sender dari grup
          let count = 0
          for (const uid of Object.keys(userWarnings)) {
            if (userWarnings[uid] > 0) {
              userWarnings[uid] = 0
              count++
            }
          }
          await alya.sendMessage(m.chat, { react: { text: '🔄', key: m.key } })
          return replyalya(`🔄 *Warning berhasil direset!*\n_Total ${count} user di-reset peringatannya._`)
        }

        default:
          return replyalya(`❌ Subcommand tidak dikenal.\nGunakan: \`${prefix}antitoxic on/off/reset\``)
      }
    }

    // ============================================================
    // .addbadword [kata] — Tambah kata kasar ke list global
    // ============================================================
    if (command === 'addbadword') {
      if (!isAdminOrOwner) return replytolak('❌ Hanya admin/owner!')
      const kata = text?.trim().toLowerCase()
      if (!kata) return replyalya(`❌ Ketik kata yang mau ditambahkan!\nContoh: \`${prefix}addbadword anjay\``)

      // Support multi-kata sekaligus (pisah koma)
      const kataList = kata.split(',').map(k => k.trim()).filter(Boolean)
      const added = []
      const skipped = []

      for (const k of kataList) {
        if (!Array.isArray(badwords)) { /* skip */ continue }
        if (badwords.includes(k)) {
          skipped.push(k)
        } else {
          badwords.push(k)
          added.push(k)
        }
      }

      // Simpan ke disk
      try {
        const fs = require('fs')
        fs.writeFileSync('./database/bad.json', JSON.stringify(badwords, null, 2))
      } catch(e) { console.error('[addbadword] gagal simpan:', e.message) }

      await alya.sendMessage(m.chat, { react: { text: '➕', key: m.key } })
      let msg = ''
      if (added.length > 0)   msg += `✅ *Berhasil ditambah:* ${added.map(k => `\`${k}\``).join(', ')}\n`
      if (skipped.length > 0) msg += `ℹ️ *Sudah ada:* ${skipped.map(k => `\`${k}\``).join(', ')}\n`
      msg += `\n📋 Total kata kasar: *${badwords.length} kata*`
      return replyalya(msg)
    }

    // ============================================================
    // .delbadword [kata] — Hapus kata kasar dari list global
    // ============================================================
    if (command === 'delbadword') {
      if (!isAdminOrOwner) return replytolak('❌ Hanya admin/owner!')
      const kata = text?.trim().toLowerCase()
      if (!kata) return replyalya(`❌ Ketik kata yang mau dihapus!\nContoh: \`${prefix}delbadword anjay\``)

      const kataList = kata.split(',').map(k => k.trim()).filter(Boolean)
      const removed = []
      const notFound = []

      for (const k of kataList) {
        if (!Array.isArray(badwords)) continue
        const idx = badwords.indexOf(k)
        if (idx !== -1) {
          badwords.splice(idx, 1)
          removed.push(k)
        } else {
          notFound.push(k)
        }
      }

      try {
        const fs = require('fs')
        fs.writeFileSync('./database/bad.json', JSON.stringify(badwords, null, 2))
      } catch(e) { console.error('[delbadword] gagal simpan:', e.message) }

      await alya.sendMessage(m.chat, { react: { text: '➖', key: m.key } })
      let msg = ''
      if (removed.length > 0)  msg += `✅ *Berhasil dihapus:* ${removed.map(k => `\`${k}\``).join(', ')}\n`
      if (notFound.length > 0) msg += `❌ *Tidak ditemukan:* ${notFound.map(k => `\`${k}\``).join(', ')}\n`
      msg += `\n📋 Sisa kata kasar: *${badwords.length} kata*`
      return replyalya(msg)
    }

    // ============================================================
    // .listbadword — Tampilkan semua kata kasar
    // ============================================================
    if (command === 'listbadword') {
      if (!isAdminOrOwner) return replytolak('❌ Hanya admin/owner!')
      if (!Array.isArray(badwords) || badwords.length === 0) {
        return replyalya(
          `📋 *Daftar Kata Kasar*\n\n` +
          `_Belum ada kata kasar terdaftar._\n` +
          `Tambah dengan: \`${prefix}addbadword [kata]\``
        )
      }

      // Tampilkan dengan pagination sederhana (max 50 per tampil)
      const shown = badwords.slice(0, 50)
      const more  = badwords.length > 50 ? `\n_...dan ${badwords.length - 50} kata lainnya_` : ''

      return replyalya(
        `☣️ *DAFTAR KATA KASAR* (${badwords.length} total)\n\n` +
        shown.map((k, i) => `${i + 1}. \`${k}\``).join('\n') +
        more + `\n\n` +
        `➕ \`${prefix}addbadword [kata]\`\n` +
        `➖ \`${prefix}delbadword [kata]\``
      )
    }
  }
}
