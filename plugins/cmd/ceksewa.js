// Plugin: ceksewa
// Fix: require sewa functions, gunakan global.sewa
// Commands: ceksewa

const { msToDate } = require('../../lib/sewa')

module.exports = {
  command: ['ceksewa'],
  tags: ['info'],
  run: async (alya, m, ctx) => {
    const { replyalya, replytolak } = ctx

    if (!m.isGroup) return replytolak('❌ Perintah ini hanya bisa digunakan di dalam grup!')

    const sewa = global.sewa || []
    const x = sewa.find(s => s.id === m.chat)

    if (!x) return replyalya('❌ Grup ini belum menyewa bot.')

    let groupMeta
    try {
      groupMeta = await alya.groupMetadata(m.chat)
    } catch {
      groupMeta = { subject: 'Tidak diketahui' }
    }

    const expiredText = x.expired === 'PERMANENT'
      ? 'PERMANENT'
      : (() => {
          const sisa = x.expired - Date.now()
          return sisa > 0 ? msToDate(sisa) : '⚠️ SUDAH EXPIRED'
        })()

    replyalya(
      `⬣ *CEK SEWA GRUP*\n\n` +
      `🏷️ Nama    : *${groupMeta.subject}*\n` +
      `🆔 ID      : *${x.id}*\n` +
      `⏳ Expired : *${expiredText}*`
    )
  }
}
