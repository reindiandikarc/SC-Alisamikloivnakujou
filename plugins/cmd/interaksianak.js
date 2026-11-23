// Plugin: interaksianak
// Family System V1 - Interaksi dengan anak
// Commands: interaksianak

const path = require('path')

const AKSI_ANAK = [
  "mengajaknya bermain bola di taman",
  "membacakan dongeng sebelum tidur",
  "mengajarinya membaca huruf",
  "mengajaknya jalan-jalan sore",
  "memeluknya dan bilang sayang",
  "menyuapinya makan",
  "menggambar bareng dia",
  "mengajaknya main petak umpet"
]

module.exports = {
  command: ["interaksianak"],
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

    const namedChildren = users.family.children.filter(c => c.name)
    if (namedChildren.length === 0) {
      return replyalya("😔 Lu belum punya anak yang sudah dikasih nama. Cek *.cekumuranak* atau kasih nama dulu pakai *.berinamaanak <Nama>*.")
    }

    // Jika ada lebih dari 1 anak, dan user kasih nama spesifik di argumen
    let targetChild = null
    if (text && text.trim()) {
      targetChild = namedChildren.find(c => c.name.toLowerCase() === text.trim().toLowerCase())
      if (!targetChild) {
        return replyalya(`⚠️ Gak ketemu anak dengan nama "${text.trim()}". Cek nama anak lu di *.cekumuranak*.`)
      }
    } else {
      targetChild = namedChildren[0]
    }

    users.family.lastInteraksiAnak ??= 0
    let cooldown = 5 * 60 * 1000 // 5 menit
    let timeLapse = Date.now() - users.family.lastInteraksiAnak
    if (timeLapse < cooldown) {
      let sisa = Math.ceil((cooldown - timeLapse) / 1000)
      return replyalya(`⏳ Anak lu lagi istirahat dulu. Tunggu ${sisa} detik lagi.`)
    }
    users.family.lastInteraksiAnak = Date.now()

    const randomAksi = AKSI_ANAK[Math.floor(Math.random() * AKSI_ANAK.length)]
    targetChild.affection = (targetChild.affection || 0) + 2

    let teks = `👨‍👧 *INTERAKSI ANAK* 👨‍👧\n\n`
    teks += `Lu *${randomAksi}* bareng *${targetChild.name}*.\n`
    teks += `Dia keliatan senang banget sama lu!\n\n`
    teks += `📈 Affection +2 (Total: ${targetChild.affection})`

    return alya.sendMessage(m.chat, { text: teks }, { quoted: m })
  }
}
