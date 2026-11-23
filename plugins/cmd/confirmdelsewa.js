// Plugin: confirmdelsewa
// Fix: require sewa functions langsung, gunakan global.sewa
// Commands: confirmdelsewa

const { getSewaPosition } = require('../../lib/sewa')
const fs = require('fs')

module.exports = {
  command: ["confirmdelsewa"],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, prefix,
      Ryuu,
      reply, replyalya, replytolak,
      mess
    } = ctx

    if (!Ryuu) return replytolak(mess.only.owner)

    const id = args[0]
    if (!id) return replyalya('❌ ID grup tidak valid!')

    const sewa = global.sewa || []
    const pos = getSewaPosition(id, sewa)
    if (pos === -1) return replyalya('❌ Grup tidak ditemukan dalam data sewa!')

    sewa.splice(pos, 1)
    global.sewa = sewa
    fs.writeFileSync('./database/sewa.json', JSON.stringify(sewa, null, 2))

    try {
      await alya.groupLeave(id)
    } catch (err) {
      console.log('Gagal keluar grup:', err)
    }

    replyalya(
      `✅ Sewa grup berhasil dihapus!\n` +
      `🚪 Bot telah keluar dari grup\n` +
      `🆔 ID: ${id}`
    )
  }
}
