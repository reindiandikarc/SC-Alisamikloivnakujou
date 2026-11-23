// Plugin: liburan
// Family System V1 - Liburan keluarga (waifu/husbu + anak)
// Commands: liburan

const path = require('path')

const DESTINASI_LIBURAN = [
  { nama: "Pantai Kuta, Bali", biaya: 1500000 },
  { nama: "Kebun Binatang Ragunan", biaya: 300000 },
  { nama: "Taman Mini Indonesia Indah", biaya: 250000 },
  { nama: "Dufan Ancol", biaya: 800000 },
  { nama: "Gunung Bromo", biaya: 1200000 },
  { nama: "Malioboro, Yogyakarta", biaya: 600000 },
  { nama: "Trans Studio Bandung", biaya: 700000 }
]

module.exports = {
  command: ["liburan"],
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
    users.money ??= 0

    const punyaWaifu = users.waifu && users.waifu.name
    const punyaHusbu = users.husbu && users.husbu.name
    const pasangan = punyaWaifu ? users.waifu.name : (punyaHusbu ? users.husbu.name : null)

    if (!pasangan) {
      return replyalya("😔 Lu belum nikah, gak ada yang diajak liburan.")
    }

    const namedChildren = users.family.children.filter(c => c.name)

    users.family.lastLiburan ??= 0
    let cooldown = 12 * 60 * 60 * 1000 // 12 jam
    let timeLapse = Date.now() - users.family.lastLiburan
    if (timeLapse < cooldown) {
      let sisaJam = Math.ceil((cooldown - timeLapse) / (60 * 60 * 1000))
      return replyalya(`⏳ Keluarga lu baru aja liburan. Tunggu ${sisaJam} jam lagi sebelum liburan berikutnya.`)
    }

    const destinasi = DESTINASI_LIBURAN[Math.floor(Math.random() * DESTINASI_LIBURAN.length)]

    if (users.money < destinasi.biaya) {
      return replyalya(`💸 Liburan ke *${destinasi.nama}* butuh biaya Rp ${destinasi.biaya.toLocaleString('id-ID')}, sedangkan uang lu cuma Rp ${users.money.toLocaleString('id-ID')}.\n\nNabung dulu ya sebelum ngajak liburan keluarga.`)
    }

    users.money -= destinasi.biaya
    users.family.lastLiburan = Date.now()

    // Tambah affection ke pasangan
    if (punyaWaifu) users.waifu.affection = (users.waifu.affection || 0) + 5
    if (punyaHusbu) users.husbu.affection = (users.husbu.affection || 0) + 5

    // Tambah affection ke semua anak yang udah dinamai
    namedChildren.forEach(c => { c.affection = (c.affection || 0) + 5 })

    let teks = `🏖️ *LIBURAN KELUARGA* 🏖️\n\n`
    teks += `Keluarga lu liburan bareng ke *${destinasi.nama}*!\n`
    teks += `💰 Biaya perjalanan: Rp ${destinasi.biaya.toLocaleString('id-ID')}\n\n`
    teks += `👫 Bareng: *${pasangan}*\n`
    if (namedChildren.length > 0) {
      teks += `👶 Anak: ${namedChildren.map(c => c.name).join(', ')}\n`
    }
    teks += `\nSemua terlihat senang dan momen ini bakal jadi kenangan indah keluarga.\n`
    teks += `📈 Affection seluruh keluarga +5`

    return alya.sendMessage(m.chat, { text: teks }, { quoted: m })
  }
}
