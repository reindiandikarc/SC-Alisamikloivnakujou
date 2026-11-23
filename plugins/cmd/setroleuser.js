// Plugin: setrole / setroleuser
// Mengatur persona/role AI Interaktif Alya per user
// Commands: setrole, setroleuser

module.exports = {
  command: ['setrole', 'setroleuser'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const {
      command, q, prefix,
      sender, pushname,
      Ryuu,
      reply, replyalya,
      // AI Interactive functions — dipass via ctx dari alya.js
      handleSetRole,
      handleClearRole,
      getEffectiveRole,
      getRoleOf,
      getRoleByCount,
      ROLE_LEVELS,
      ROLE_NAMES,
      getChatCount,
    } = ctx

    // setroleuser → owner only, bisa set role orang lain
    // setrole → semua user, set diri sendiri
    const isOwnerCmd = command === 'setroleuser'
    if (isOwnerCmd && !Ryuu) return reply('⚠️ Perintah ini hanya untuk *Owner*.')

    // Tentukan target
    let target     = sender
    let targetName = pushname || sender.split('@')[0]

    if (Ryuu && (m.quoted || (m.mentionedJid && m.mentionedJid[0]))) {
      const tJid = m.mentionedJid?.[0] || m.quoted?.sender || sender
      target     = tJid
      try { targetName = await alya.getName(tJid) || tJid.split('@')[0] } catch { targetName = tJid.split('@')[0] }
    }

    const roleData = getEffectiveRole(target)
    const chatCnt  = getChatCount(target)

    // Baris daftar role otomatis berdasarkan jumlah chat
    const roleListStr = ROLE_LEVELS.map(r => {
      const active = !roleData.isManual && r.role === roleData.role ? '▶️' : '   '
      return `${active} ${r.emoji} *${r.role}* — min ${r.min} chat`
    }).join('\n')

    // ── Tanpa argumen: tampilkan info & daftar role ──
    if (!q || q.trim().length < 2) {
      return reply(
        `╭─「 🎭 *SETROLE AI ALYA* 」\n` +
        `│\n` +
        `│ 👤 *User     :* ${targetName}\n` +
        `│ 💬 *Total Chat:* ${chatCnt}x\n` +
        `│ 🎭 *Role aktif:* ${roleData.emoji || ''} ${roleData.role}${roleData.isManual ? ' _(custom)_' : ' _(auto)_'}\n` +
        `│\n` +
        `├─ 📋 *Daftar Role Otomatis:*\n` +
        `│  (naik otomatis sesuai jumlah chat)\n` +
        `│\n` +
        `${roleListStr.split('\n').map(l => `│ ${l}`).join('\n')}\n` +
        `│\n` +
        `├─ *Cara pakai:*\n` +
        `│ ✏️  ${prefix}setrole <nama_role>  — Set role custom\n` +
        `│ 🔄 ${prefix}setrole reset        — Kembali ke auto\n` +
        `│\n` +
        `├─ *Contoh:*\n` +
        `│ ${prefix}setrole Pacar\n` +
        `│ ${prefix}setrole Sahabat Sejati\n` +
        `│ ${prefix}setrole Soulmate\n` +
        `│ ${prefix}setrole reset\n` +
        `│\n` +
        `│ 💡 _Role custom membuat Alya lebih ekspresif_\n` +
        `│ 💡 _sesuai hubungan yang kamu tentukan~_\n` +
        `╰──────────────────`
      )
    }

    const roleArg = q.trim()

    // ── Reset role ke auto ──
    if (['reset', 'hapus', 'auto', 'default'].includes(roleArg.toLowerCase())) {
      const removed = handleClearRole(target)
      const newData = getEffectiveRole(target)
      return reply(
        removed
          ? `✅ *Role di-reset!*\n\n` +
            `👤 *${targetName}* kembali ke role otomatis:\n` +
            `${newData.emoji || ''} *${newData.role}*\n\n` +
            `_Role naik otomatis seiring jumlah chat bertambah._`
          : `ℹ️ Tidak ada role custom untuk ${targetName}.`
      )
    }

    // ── Set role custom ──
    const ok = handleSetRole(target, roleArg)
    if (ok) {
      await alya.sendMessage(m.chat, { react: { text: '🎭', key: m.key } })
      reply(
        `╭─「 🎭 *ROLE BERHASIL DIUBAH!* 」\n` +
        `│\n` +
        `│ 👤 *User  :* ${targetName}\n` +
        `│ 🎭 *Role  :* _${roleArg}_\n` +
        `│\n` +
        `│ Alya sekarang akan berinteraksi dengan\n` +
        `│ ${targetName} sesuai peran _"${roleArg}"_ ✨\n` +
        `│\n` +
        `│ _Gunakan ${prefix}setrole reset untuk kembali ke auto_\n` +
        `╰──────────────────`
      )
    } else {
      reply('❌ Gagal mengatur role. Coba lagi.')
    }
  }
}
