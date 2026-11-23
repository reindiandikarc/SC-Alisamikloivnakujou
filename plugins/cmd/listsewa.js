// Plugin: listsewa
// Fix: require sewa functions, gunakan global.sewa
// Commands: listsewa

const { msToDate, getGcName } = require('../../lib/sewa')

module.exports = {
  command: ['listsewa'],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const { Ryuu, replyalya, replytolak, mess } = ctx

    if (!Ryuu) return replytolak(mess?.only?.owner || '❌ Fitur ini khusus Owner!')

    const sewa = global.sewa || []
    if (sewa.length === 0) return replyalya('📭 Belum ada data sewa.')

    let teks = `📋 *Daftar Sewa Aktif*\n\n`
    for (let x of sewa) {
      teks += `🏷️ Nama : *${await getGcName(x.id)}*\n`
      teks += `🆔 ID   : ${x.id}\n`
      if (x.expired === 'PERMANENT') {
        teks += `⏳ Expired : PERMANENT\n\n`
      } else {
        const sisa = x.expired - Date.now()
        teks += `⏳ Expired : ${sisa > 0 ? msToDate(sisa) : '⚠️ SUDAH EXPIRED'}\n\n`
      }
    }

    alya.sendMessage(m.chat, { text: teks.trim() }, { quoted: m })
  }
}
