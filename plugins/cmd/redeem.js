// Plugin: redeem
// Ported from Alya V10 → V13 Plugin System
// Commands: redeem

const fs = require('fs')
const crypto = require('crypto')

module.exports = {
  command: ['redeem'],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const {
      text, prefix, command,
      Ryuu,
      replyalya
    } = ctx

    if (!text) return replyalya(`🎁 Contoh:\n${prefix + command} ABC123`)

    const dbPath = './database/redeem.json'
    let redeemDB = {}
    try { redeemDB = JSON.parse(fs.readFileSync(dbPath, 'utf8')) } catch { redeemDB = {} }

    const kode = text.trim().toUpperCase()

    if (!redeemDB[kode])
      return replyalya('❌ Kode redeem tidak ditemukan!')

    const data = redeemDB[kode]

    if (Date.now() > data.expire)
      return replyalya('⏳ Kode sudah expired!')

    if (data.ownerOnly && !Ryuu)
      return replyalya('🔒 Kode ini khusus owner!')

    if (data.usedBy.length >= data.maxUse)
      return replyalya('❌ Kode sudah mencapai batas penggunaan!')

    const deviceID = crypto.createHash('md5').update(m.sender).digest('hex')

    if (data.usedBy.includes(deviceID))
      return replyalya('⚠️ Kamu sudah pernah menggunakan kode ini!')

    // Update global.db.users
    if (!global.db.users[m.sender]) {
      global.db.users[m.sender] = { limit: 0, money: 0 }
    }
    const user = global.db.users[m.sender]
    user.limit = (user.limit || 0) + data.limit
    user.money = (user.money || 0) + data.money

    data.usedBy.push(deviceID)
    fs.writeFileSync(dbPath, JSON.stringify(redeemDB, null, 2))

    replyalya(
      `✅ *REDEEM BERHASIL!*\n\n` +
      `🎁 Limit +${data.limit}\n` +
      `💰 Money +${data.money}\n\n` +
      `📊 Sisa kuota: ${data.maxUse - data.usedBy.length}`
    )
  }
}
