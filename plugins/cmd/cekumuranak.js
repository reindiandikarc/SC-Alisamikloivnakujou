// Plugin: cekumuranak
// Family System V1 - Cek umur anak (1 hari real = 1 bulan)
// Commands: cekumuranak

const path = require('path')

function formatUmur(bornAt) {
  const elapsedMs = Date.now() - bornAt
  const msPerBulan = 24 * 60 * 60 * 1000 // 1 hari = 1 bulan
  const totalBulan = Math.floor(elapsedMs / msPerBulan)
  const tahun = Math.floor(totalBulan / 12)
  const bulan = totalBulan % 12

  if (totalBulan < 1) {
    const jam = Math.floor(elapsedMs / (60 * 60 * 1000))
    return `Baru lahir (${jam} jam, masih bayi merah)`
  }
  if (tahun === 0) return `${bulan} bulan`
  return `${tahun} tahun ${bulan} bulan`
}

module.exports = {
  command: ["cekumuranak"],
  tags: ['family'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix, body, budy,
      sender, from, pushname, botNumber,
      reply, replyalya, replytolak, replyprem,
      senderNumber, chath, pes, messagesC, bady,
      waifuList, husbuList, pler, setting, user
    } = ctx

    let users = global.db.users[m.sender]
    users.family ??= {}
    users.family.children ??= []

    if (users.family.children.length === 0) {
      return replyalya("😔 Lu belum punya anak.")
    }

    let teks = `👨‍👩‍👧‍👦 *DAFTAR ANAK* 👨‍👩‍👧‍👦\n\n`
    users.family.children.forEach((c, i) => {
      const nama = c.name || "(belum dikasih nama)"
      teks += `${i + 1}. *${nama}*\n`
      teks += `   📅 Umur: ${formatUmur(c.bornAt)}\n`
      teks += `   💞 Affection: ${c.affection || 0}\n\n`
    })
    teks += `_Catatan: 1 hari = 1 bulan usia anak._`

    return alya.sendMessage(m.chat, { text: teks }, { quoted: m })
  }
}
