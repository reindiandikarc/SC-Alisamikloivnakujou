// Plugin: fighting
// Ported from Alya V12 - Fixed for V13
// Commands: fighting

const path = require('path')

module.exports = {
  command: ["fighting"],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix, body, budy,
      sender, from, pushname, botNumber,
      isCmd, isGroup, isMedia, isImage, isVideo, isAudio, isSticker,
      isQuotedImage, isQuotedVideo, isQuotedSticker, isQuotedAudio,
      isQuotedDocument, isQuotedViewOnce, isQuotedLocation, isQuotedContact,
      groupMetadata, groupName, groupMembers, groupAdmins, groupOwner,
      isBotAdmins, isGroupAdmins, isAdmins, isAdminOrOwner,
      Ryuu, isPrem, isAly, isAlya, isSewa, jangan,
      quoted, mime, qmsg, content, type, chatUpdate, store,
      reply, replyalya, replytolak, replyprem,
      senderNumber, chath, pes, messagesC, bady,
      waifuList, husbuList, pler, setting, user
    } = ctx

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
    const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

    const alasanMenang = [
      'levelmu jauh lebih tinggi', 'teknikmu sangat superior',
      'keberuntungan berpihak padamu', 'kamu bertarung dengan penuh semangat',
      'lawan tidak siap menghadapi kamu'
    ]
    const alasanKalah = [
      'levelmu masih kurang tinggi', 'lawan terlalu kuat untukmu',
      'nasib sedang tidak berpihak', 'kamu kurang latihan',
      'lawan menggunakan taktik tersembunyi'
    ]

    if (!m.isGroup) return replytolak(mess.only.group)

    alya.fight = alya.fight || {}
    let userAlt = global.db.users[m.sender]
    if (!userAlt) return replyalya('❌ Data user tidak ditemukan')
    userAlt.level ??= 1
    userAlt.money ??= 0
    userAlt.limit ??= 0

    if (alya.fight[m.sender]) return replyalya('⚔️ Kamu masih dalam pertarungan, tunggu selesai!')

    let members = groupMembers.map(a => a.id)
    let lawan
    let attempts = 0
    do {
      lawan = members[Math.floor(members.length * Math.random())]
      attempts++
    } while ((typeof global.db.users[lawan] === 'undefined' || lawan === m.sender) && attempts < 50)

    if (!global.db.users[lawan] || lawan === m.sender)
      return replyalya('❌ Tidak ada lawan yang bisa ditantang di grup ini')

    const lawanAlt = global.db.users[lawan]
    lawanAlt.level ??= 1
    lawanAlt.money ??= 0
    lawanAlt.limit ??= 0

    replyalya(`⚔️ *Kamu* (level ${userAlt.level}) menantang *${alya.getName(lawan)}* (level ${lawanAlt.level})!\n\nTunggu 5 menit untuk melihat hasilnya...`)
    alya.fight[m.sender] = true
    await delay(300000)

    let kesempatan = []
    for (let i = 0; i < userAlt.level; i++) kesempatan.push(m.sender)
    for (let i = 0; i < lawanAlt.level; i++) kesempatan.push(lawan)

    let pointPemain = 0, pointLawan = 0
    for (let i = 0; i < 10; i++) {
      let unggul = kesempatan[getRandom(0, kesempatan.length - 1)]
      if (unggul === m.sender) pointPemain++
      else pointLawan++
    }

    if (pointPemain > pointLawan) {
      let hadiah = (pointPemain - pointLawan) * 10000
      userAlt.money += hadiah
      userAlt.limit += 1
      replyalya(`🏆 *${alya.getName(m.sender)}* [${pointPemain * 10}] - [${pointLawan * 10}] *${alya.getName(lawan)}*\n\n*Kamu* (level ${userAlt.level}) menang melawan *${alya.getName(lawan)}* (level ${lawanAlt.level}) karena ${alasanMenang[getRandom(0, alasanMenang.length - 1)]}\n\n💰 Hadiah: ${hadiah.toLocaleString()}\n+1 Limit`)
    } else if (pointPemain < pointLawan) {
      let denda = (pointLawan - pointPemain) * 100000
      userAlt.money = Math.max(0, userAlt.money - denda)
      userAlt.limit += 1
      replyalya(`💀 *${alya.getName(m.sender)}* [${pointPemain * 10}] - [${pointLawan * 10}] *${alya.getName(lawan)}*\n\n*Kamu* (level ${userAlt.level}) kalah melawan *${alya.getName(lawan)}* (level ${lawanAlt.level}) karena ${alasanKalah[getRandom(0, alasanKalah.length - 1)]}\n\n💸 Denda: ${denda.toLocaleString()}\n+1 Limit`)
    } else {
      replyalya(`🤝 *${alya.getName(m.sender)}* [${pointPemain * 10}] - [${pointLawan * 10}] *${alya.getName(lawan)}*\n\nHasil imbang! Tidak ada yang menang atau kalah.`)
    }

    delete alya.fight[m.sender]
  }
}
