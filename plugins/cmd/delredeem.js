// Plugin: delredeem
// Ported for Alya V13 Plugin System
// Commands: delredeem

const fs = require('fs')

module.exports = {
  command: ["delredeem"],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const {
      text, prefix, command,
      Ryuu,
      replyalya, replytolak
    } = ctx

    if (!Ryuu) return replytolak(mess.only.owner)
    if (!text) return replyalya(`Masukkan kode redeem yang ingin dihapus.\n\nContoh: ${prefix + command} ABC123`)

    const dbPath = './database/redeem.json'
    const redeemDB = JSON.parse(fs.readFileSync(dbPath))

    const kode = text.trim().toUpperCase()

    if (!redeemDB[kode]) return replyalya(`❌ Kode *${kode}* tidak ditemukan.`)

    delete redeemDB[kode]
    fs.writeFileSync(dbPath, JSON.stringify(redeemDB, null, 2))

    replyalya(`🗑️ Kode redeem *${kode}* berhasil dihapus.`)
  }
}
