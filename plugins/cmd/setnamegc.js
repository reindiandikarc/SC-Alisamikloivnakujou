// Plugin: setnamegc
// Ported from Alya V12 alya.js
// Commands: setnamegc, setgroupname, setsubject

module.exports = {
  command: ['setnamegc', 'setgroupname', 'setsubject'],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const {
      text, q, prefix, command,
      isGroup, isGroupAdmins, isBotAdmins, Ryuu,
      reply, replyalya, replytolak
    } = ctx

    if (!isGroup) return replytolak('Perintah ini hanya bisa digunakan di grup!')
    if (!isBotAdmins) return replytolak('Bot harus menjadi admin terlebih dahulu!')
    if (!isGroupAdmins && !Ryuu) return replytolak('Khusus Admin!!')
    if (!text) return replyalya(`Masukan nama grup baru!\nContoh: *${prefix}${command} Nama Grup Baru*`)

    await alya.groupUpdateSubject(m.chat, text)
    await replyalya(`✅ Nama grup berhasil diubah menjadi:\n*${text}*`)
  }
}
