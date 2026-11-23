// Plugin: fightgriffin
// Ported from Alya V12 - Fixed for V13
// Commands: fightgriffin

const path = require('path')

module.exports = {
  command: ["fightgriffin"],
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

    if (!m.isGroup) return replytolak(mess.only.group)

    const delay = (ms) => new Promise(res => setTimeout(res, ms))
    const Acakin = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

    const alasanKalah = ['Naikin lagi levelnya', 'Cupu', 'Kurang hebat', 'Ampas Petnya', 'Pet gembel']
    const alasanMenang = ['Hebat', 'Pro', 'Ganas Pet', 'Legenda Pet', 'Sangat Pro', 'Rajin Ngasi Makan Pet']

    alya.fightnaga = alya.fightnaga || {}
    if (alya.fightnaga[m.sender]) return reply('⚔️ Tidak bisa fight karena Arena sedang dipakai oleh pet kamu yang lain.')

    const userAlt = global.db.users[m.sender]
    if (!userAlt) return replyalya('❌ Data user tidak ditemukan')
    userAlt.griffin ??= 1
    userAlt.money ??= 0
    userAlt.tiketcoin ??= 0

    let members = groupMembers.map(u => u.id)
    let lawan
    let attempts = 0
    do {
      lawan = members[Math.floor(members.length * Math.random())]
      attempts++
    } while ((typeof global.db.users[lawan] === 'undefined' || lawan === m.sender) && attempts < 50)

    if (!global.db.users[lawan] || lawan === m.sender)
      return replyalya('❌ Tidak ada lawan yang bisa ditantang di grup ini')

    const lawanAlt = global.db.users[lawan]
    lawanAlt.griffin ??= 1
    lawanAlt.money ??= 0
    lawanAlt.tiketcoin ??= 0

    const lamaPertarungan = Acakin(1, 3)

    reply(`*Pet Kamu* (🦚griffin ${userAlt.griffin}) ⚔️ menantang 🦚griffinnya *${alya.getName(lawan)}* (🦚griffin ${lawanAlt.griffin}) lagi berkelahi.\n\nTunggu ${lamaPertarungan} menit dan lihat siapa yang menang 🎮`)

    alya.fightnaga[m.sender] = true
    await delay(1000 * 60 * lamaPertarungan)

    let kesempatan = []
    for (let i = 0; i < userAlt.griffin; i++) kesempatan.push(m.sender)
    for (let i = 0; i < lawanAlt.griffin; i++) kesempatan.push(lawan)

    let pointPemain = 0, pointLawan = 0
    for (let i = 0; i < 10; i++) {
      let unggul = kesempatan[Acakin(0, kesempatan.length - 1)]
      if (unggul === m.sender) pointPemain++
      else pointLawan++
    }

    if (pointPemain > pointLawan) {
      let hadiah = (pointPemain - pointLawan) * 20000
      userAlt.money += hadiah
      userAlt.tiketcoin += 1
      reply(`🏆 *${alya.getName(m.sender)}* [${pointPemain * 10}] - [${pointLawan * 10}] *${alya.getName(lawan)}*\n\n*Pet 🦚Kamu* (griffin ${userAlt.griffin}) MENANG melawan 🦚griffinnya *${alya.getName(lawan)}* (griffin ${lawanAlt.griffin}) karena griffin 🦚kamu ${alasanMenang[Acakin(0, alasanMenang.length - 1)]}\n\n💰 Hadiah Rp. ${hadiah.toLocaleString()}\n+1 Tiketcoin`)
    } else if (pointPemain < pointLawan) {
      let denda = (pointLawan - pointPemain) * 10000
      userAlt.money = Math.max(0, userAlt.money - denda)
      userAlt.tiketcoin += 1
      reply(`💀 *${alya.getName(m.sender)}* [${pointPemain * 10}] - [${pointLawan * 10}] *${alya.getName(lawan)}*\n\n*Pet 🦚Kamu* (griffin ${userAlt.griffin}) KALAH melawan 🦚griffinnya *${alya.getName(lawan)}* (griffin ${lawanAlt.griffin}) karena ${alasanKalah[Acakin(0, alasanKalah.length - 1)]}\n\n💸 Uang berkurang Rp. ${denda.toLocaleString()}\n+1 Tiketcoin`)
    } else {
      reply(`🤝 *${alya.getName(m.sender)}* [${pointPemain * 10}] - [${pointLawan * 10}] *${alya.getName(lawan)}*\n\nHasil imbang, ga dapet apa-apa 😂`)
    }

    delete alya.fightnaga[m.sender]
  }
}
