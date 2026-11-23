// Plugin: setnamegroup
// Ported from Alya V10 → V13 Plugin System
// Commands: setnamegroup, setnamegc, setgroupname, setsubject

module.exports = {
  command: ["setnamegroup", "setnamegc", "setgroupname", "setsubject"],
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
    if (!text) return replyalya(`Masukkan nama grup baru!\n\nContoh: ${prefix + command} Nama Grup Baru`)

    await alya.groupUpdateSubject(m.chat, text)
    await replyalya(`*[ Done ]*\n✅ Nama grup berhasil diubah menjadi: *${text}*`)
  }
}
