// Plugin: berinamaanak
// Family System V1 - Kasih nama anak
// Commands: berinamaanak

const path = require('path')

module.exports = {
  command: ["berinamaanak"],
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
      return replyalya("😔 Lu belum punya anak. Proses lahiran dulu pakai *.lahiranwaifu*.")
    }

    const namaAnak = text ? text.trim() : ""
    if (!namaAnak) {
      return replyalya("⚠️ Masukin nama anaknya dong. Contoh: *.berinamaanak Hikari*")
    }
    if (namaAnak.length > 30) {
      return replyalya("⚠️ Nama kepanjangan, maksimal 30 karakter ya.")
    }

    // Cari anak yang belum punya nama (anak terbaru yang belum dinamai)
    let belumDinamai = users.family.children.find(c => !c.name)
    if (!belumDinamai) {
      return replyalya("🙂 Semua anak lu udah punya nama semua.")
    }

    belumDinamai.name = namaAnak

    let teks = `📝 *PEMBERIAN NAMA* 📝\n\n`
    teks += `Selamat! Anak lu sekarang resmi bernama:\n`
    teks += `👶 *${namaAnak}*\n\n`
    teks += `Semoga tumbuh sehat dan jadi anak yang membanggakan ya!\n`
    teks += `Cek umurnya kapan aja pakai *.cekumuranak*.`

    return alya.sendMessage(m.chat, { text: teks }, { quoted: m })
  }
}
