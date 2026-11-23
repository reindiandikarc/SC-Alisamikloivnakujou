// Plugin: listredeem
// Ported from Alya V10 → V13 Plugin System (FIXED - indentation)
// Commands: listredeem

const fs = require('fs')

module.exports = {
  command: ["listredeem"],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const { Ryuu, replyalya, replytolak } = ctx

    if (!Ryuu) return replytolak(mess.only.owner)

    const dbPath = './database/redeem.json'
    const redeemDB = JSON.parse(fs.readFileSync(dbPath))

    if (Object.keys(redeemDB).length === 0)
      return replyalya('Belum ada kode redeem.')

    let teks = '📜 *DAFTAR KODE REDEEM*\n\n'

    for (let kode in redeemDB) {
      const data = redeemDB[kode]
      const sisa   = data.maxUse - data.usedBy.length
      const status = Date.now() > data.expire ? '❌ Expired' : '✅ Active'

      teks += `🎟 *${kode}*\n` +
              `   Limit     : ${data.limit}\n` +
              `   Money     : ${data.money}\n` +
              `   Sisa      : ${sisa}/${data.maxUse}\n` +
              `   Status    : ${status}\n` +
              `   OwnerOnly : ${data.ownerOnly}\n\n`
    }

    replyalya(teks)
  }
}
