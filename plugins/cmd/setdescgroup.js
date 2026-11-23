// Plugin: setdescgroup
// Ported from Alya V10 → V13 Plugin System
// Commands: setdescgroup, setdesc, setdesk

module.exports = {
  command: ["setdescgroup", "setdesc", "setdesk"],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const {
      text, prefix, command,
      isGroup, isBotAdmins, isAdmins, Ryuu,
      replyalya, replytolak
    } = ctx

    if (!isGroup) return replytolak(mess.only.group)
    if (!isBotAdmins) return replytolak('_Bot Harus Menjadi Admin Terlebih Dahulu_')
    if (!isAdmins && !Ryuu) return replytolak('Khusus Admin!!')
    if (!text) return replyalya(`Masukkan deskripsi grup baru!\n\nContoh: ${prefix + command} Deskripsi grup ini...`)

    await alya.groupUpdateDescription(m.chat, text)
    await replyalya(`*[ Done ]*\n✅ Deskripsi grup berhasil diperbarui.`)
  }
}
