// Plugin: editinfo
// Ported from Alya V10 → V13 Plugin System
// Commands: editinfo
// Fungsi: Mengunci / membuka pengaturan info grup (hanya admin yang bisa edit info)

module.exports = {
  command: ["editinfo"],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const {
      args, text, prefix, command,
      isGroup, isBotAdmins, isAdmins, Ryuu,
      replyalya, replytolak
    } = ctx

    if (!isGroup) return replytolak(mess.only.group)
    if (!isBotAdmins) return replytolak('_Bot Harus Menjadi Admin Terlebih Dahulu_')
    if (!isAdmins && !Ryuu) return replytolak('Khusus Admin!!')

    if (!text) return replyalya(
      `🔒 *EDIT INFO GRUP*\n\n` +
      `Atur siapa yang bisa mengubah info grup (nama, deskripsi, foto).\n\n` +
      `⚙️ *Penggunaan:*\n` +
      `• ${prefix + command} on  — Kunci (hanya admin)\n` +
      `• ${prefix + command} off — Buka (semua member)`
    )

    if (args[0] === 'on') {
      await alya.groupSettingUpdate(m.chat, 'locked')
      await replyalya(`🔒 *[ Done ]*\nInfo grup dikunci. Hanya admin yang bisa mengubah info grup.`)
    } else if (args[0] === 'off') {
      await alya.groupSettingUpdate(m.chat, 'unlocked')
      await replyalya(`🔓 *[ Done ]*\nInfo grup dibuka. Semua member bisa mengubah info grup.`)
    } else {
      replyalya(`Gunakan: ${prefix + command} on / off`)
    }
  }
}
