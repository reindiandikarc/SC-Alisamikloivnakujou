// ============================================================
// Plugin: .antibot — Proteksi grup dari bot & unofficial client
// Commands: antibot
// Fix: plugin kini mengakses antibot/antibotSettings via ctx
//      (vars global di alya.js) sehingga logika deteksi di
//      alya.js otomatis ikut terupdate tanpa restart.
// ============================================================

module.exports = {
  command: ['antibot'],
  tags: ['admin'],
  run: async (alya, m, ctx) => {
    const {
      args, prefix, command, from,
      isGroup,
      isBotAdmins, isAdmins, isAdminOrOwner, Ryuu,
      reply, replyalya, replytolak,
      // State global antibot (di-pass dari alya.js via ctx)
      antibot, antibotSettings, saveAntibot, saveAntibotSettings,
    } = ctx

    if (!isGroup)        return replytolak('❌ Perintah ini hanya untuk grup!')
    if (!isAdminOrOwner) return replytolak('❌ Hanya admin/owner yang bisa menggunakan fitur ini!')

    const isAktif      = antibot[from] === true
    const currentAction = antibotSettings[from] || 'delete'

    const sub  = (args[0] || '').toLowerCase()
    const sub2 = (args[1] || '').toLowerCase()

    // ── Tampilkan status (tanpa argumen) ──────────────────────
    if (!sub) {
      return replyalya(
        `🛡️━〔 *ANTIBOT SECURITY* 〕━🛡️\n\n` +
        `📊 *Status Sistem*\n` +
        `• Proteksi  : *${isAktif ? '✅ AKTIF (ON)' : '❌ NONAKTIF (OFF)'}*\n` +
        `• Mode Aksi : *${currentAction.toUpperCase()}*\n` +
        `• Bot Admin : *${isBotAdmins ? '✅ Ya' : '❌ Tidak (kick tidak bisa)'}*\n\n` +
        `⚙️ *Pengaturan:*\n` +
        `• \`${prefix}antibot on\`       — Aktifkan proteksi\n` +
        `• \`${prefix}antibot off\`      — Matikan proteksi\n` +
        `• \`${prefix}antibot set kick\`  — Mode: hapus + tendang\n` +
        `• \`${prefix}antibot set delete\`— Mode: hapus pesan saja\n\n` +
        `🔍 *Deteksi bot berdasarkan:*\n` +
        `› ID pesan tidak valid / karakter aneh\n` +
        `› Prefix ID khas Baileys lama (BAE5)\n` +
        `› Prefix ID khas WhatsApp Web (3EB0)\n` +
        `› Panjang ID abnormal\n\n` +
        `_Bot harus jadi admin untuk mode kick._`
      )
    }

    switch (sub) {

      // ── antibot on ─────────────────────────────────────────
      case 'on': {
        if (isAktif) return replyalya('🟢 AntiBot sudah aktif di grup ini.')
        antibot[from] = true
        saveAntibot()
        await alya.sendMessage(m.chat, { react: { text: '🛡️', key: m.key } })
        return replyalya(
          `✅ *AntiBot berhasil diaktifkan!*\n\n` +
          `• Mode aksi : *${currentAction.toUpperCase()}*\n` +
          `• Bot admin  : *${isBotAdmins ? 'Ya ✅' : 'Tidak ❌'}*\n\n` +
          `_Pesan dari bot/unofficial client akan otomatis diproses._\n` +
          (currentAction === 'kick' && !isBotAdmins
            ? `\n⚠️ Mode kick dipilih tapi bot bukan admin. Jadikan bot admin agar kick bisa berjalan.`
            : '')
        )
      }

      // ── antibot off ────────────────────────────────────────
      case 'off': {
        if (!isAktif) return replyalya('🔴 AntiBot sudah nonaktif di grup ini.')
        delete antibot[from]
        delete antibotSettings[from]
        saveAntibot()
        saveAntibotSettings()
        await alya.sendMessage(m.chat, { react: { text: '🔓', key: m.key } })
        return replyalya('🔴 *AntiBot dinonaktifkan.*\n_Grup tidak lagi diproteksi dari bot._')
      }

      // ── antibot set kick|delete ────────────────────────────
      case 'set': {
        if (!isAktif) return replyalya(`⚠️ Aktifkan dulu dengan \`${prefix}antibot on\``)
        if (!['kick', 'delete'].includes(sub2)) {
          return replyalya(
            `❌ Mode tidak dikenal!\n\n` +
            `Pilihan:\n` +
            `• \`${prefix}antibot set kick\`   — Hapus pesan + tendang\n` +
            `• \`${prefix}antibot set delete\` — Hapus pesan saja`
          )
        }
        antibotSettings[from] = sub2
        saveAntibotSettings()
        await alya.sendMessage(m.chat, { react: { text: '⚙️', key: m.key } })
        return replyalya(
          `⚙️ *Mode AntiBot diubah ke: ${sub2.toUpperCase()}*\n\n` +
          (sub2 === 'kick'
            ? `🔨 Bot akan *menghapus pesan + menendang* pengguna terdeteksi.\n` +
              (isBotAdmins ? `✅ Bot sudah admin, kick siap berjalan.` : `⚠️ Bot belum admin! Jadikan bot admin dulu.`)
            : `🗑️ Bot hanya *menghapus pesan* tanpa menendang.`)
        )
      }

      default:
        return replyalya(`❌ Subcommand tidak dikenal.\nGunakan: \`${prefix}antibot on/off/set\``)
    }
  }
}
