// Plugin: ephemeral
// Ported from Alya V10 → V13 Plugin System
// Commands: ephemeral

const { WA_DEFAULT_EPHEMERAL } = require('@whiskeysockets/baileys')

module.exports = {
  command: ["ephemeral"],
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
      `⏳ *EPHEMERAL / PESAN SEMENTARA*\n\n` +
      `Atur pesan di grup agar otomatis menghilang setelah waktu tertentu.\n\n` +
      `⚙️ *Penggunaan:*\n` +
      `• ${prefix + command} enable — Aktifkan pesan sementara\n` +
      `• ${prefix + command} disable — Matikan pesan sementara`
    )

    if (args[0] === 'enable') {
      await alya.sendMessage(m.chat, { disappearingMessagesInChat: WA_DEFAULT_EPHEMERAL })
      await replyalya(`*[ Done ]*\n✅ Pesan sementara diaktifkan.`)
    } else if (args[0] === 'disable') {
      await alya.sendMessage(m.chat, { disappearingMessagesInChat: false })
      await replyalya(`*[ Done ]*\n❌ Pesan sementara dinonaktifkan.`)
    } else {
      replyalya(`Gunakan: ${prefix + command} enable / disable`)
    }
  }
}
