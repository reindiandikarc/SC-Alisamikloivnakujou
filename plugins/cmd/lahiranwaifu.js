// Plugin: lahiranwaifu
// Family System V1 - Lahiran (biaya 12jt ke rumah sakit)
// Commands: lahiranwaifu

const path = require('path')

module.exports = {
  command: ["lahiranwaifu"],
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

    const punyaWaifu = users.waifu && users.waifu.name
    const punyaHusbu = users.husbu && users.husbu.name

    if (!punyaWaifu && !punyaHusbu) {
      return replyalya("😔 Lu belum nikah.")
    }

    const pregnancy = users.family.pregnancy
    if (!pregnancy || !pregnancy.isPregnant) {
      return replyalya("🙂 Gak ada kehamilan yang sedang berlangsung.")
    }

    const elapsedMs = Date.now() - pregnancy.startedAt
    const totalMs = 9 * 60 * 60 * 1000
    if (elapsedMs < totalMs) {
      let sisaJam = Math.ceil((totalMs - elapsedMs) / (60 * 60 * 1000))
      return replyalya(`⏳ Belum waktunya! Kandungan masih perlu ±${sisaJam} jam lagi sebelum siap lahiran. Cek progress di *.ngidam*.`)
    }

    const BIAYA_LAHIRAN = 12000000
    users.money ??= 0

    if (users.money < BIAYA_LAHIRAN) {
      return replyalya(`💸 Biaya lahiran di rumah sakit itu Rp ${BIAYA_LAHIRAN.toLocaleString('id-ID')}, sedangkan uang lu cuma Rp ${users.money.toLocaleString('id-ID')}.\n\nKumpulin uang dulu sebelum bawa ke rumah sakit ya!`)
    }

    users.money -= BIAYA_LAHIRAN

    const pasangan = pregnancy.partnerName
    const newChild = {
      id: `child_${Date.now()}`,
      name: null,
      bornAt: Date.now(),
      parentWaifuHusbu: pasangan,
      affection: 0
    }

    users.family.children.push(newChild)
    users.family.pregnancy = null

    let teks = `👶 *SELAMAT, BAYI LAHIR DENGAN SELAMAT!* 👶\n\n`
    teks += `Proses persalinan *${pasangan}* di rumah sakit berjalan lancar.\n`
    teks += `💰 Biaya rumah sakit Rp ${BIAYA_LAHIRAN.toLocaleString('id-ID')} telah dibayarkan.\n\n`
    teks += `Bayi lu sehat dan menangis kencang tanda sehat!\n`
    teks += `Sekarang kasih nama buat anak lu pakai:\n`
    teks += `*.berinamaanak <Nama>*`

    return alya.sendMessage(m.chat, { text: teks, mentions: [m.sender] }, { quoted: m })
  }
}
