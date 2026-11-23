// Plugin: addredeem
// Ported from Alya V10 → V13 Plugin System (FIXED - indentation + crypto)
// Commands: addredeem

const fs = require('fs')
const crypto = require('crypto')

module.exports = {
  command: ["addredeem"],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const {
      text, prefix, command,
      Ryuu,
      replyalya, replytolak
    } = ctx

    if (!Ryuu) return replytolak(mess.only.owner)

    if (!text) return replyalya(
      `Format:\n${prefix + command} limit|money|maxUse|hari|ownerOnly\n\n` +
      `Contoh:\n${prefix + command} 10|5000|5|7|false`
    )

    const dbPath = './database/redeem.json'
    const redeemDB = JSON.parse(fs.readFileSync(dbPath))

    const [limit, money, maxUse, hari, ownerOnly] = text.split('|')
    if (!limit || !money || !maxUse || !hari || !ownerOnly)
      return replyalya('❌ Format salah! Pastikan semua field diisi dengan pemisah |')

    const kode = crypto.randomBytes(4).toString('hex').toUpperCase()
    const expire = Date.now() + (Number(hari) * 86400000)

    redeemDB[kode] = {
      limit: Number(limit),
      money: Number(money),
      maxUse: Number(maxUse),
      expire: expire,
      ownerOnly: ownerOnly.trim() === 'true',
      usedBy: []
    }

    fs.writeFileSync(dbPath, JSON.stringify(redeemDB, null, 2))

    replyalya(
      `✅ *Kode Redeem Berhasil Dibuat*\n\n` +
      `🎟 Kode     : *${kode}*\n` +
      `🎁 Limit    : ${limit}\n` +
      `💰 Money    : ${money}\n` +
      `👥 Max Use  : ${maxUse}\n` +
      `⏳ Expire   : ${hari} hari\n` +
      `🔒 Owner Only : ${ownerOnly.trim()}`
    )
  }
}
