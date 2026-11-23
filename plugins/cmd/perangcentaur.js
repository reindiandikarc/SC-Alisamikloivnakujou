// Plugin: perangcentaur
// Auto-generated from Alya V12
// Commands: fightcentaur, perangcentaur

const path = require('path')

module.exports = {
  command: ["fightcentaur", "perangcentaur"],
  tags: ['general'],
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
      function Acakin(min,max){
      min = Math.ceil(min)
      max = Math.floor(max)
      return Math.floor(Math.random()*(max-min+1)) + min
    }
    let penumpan = ['mas mas', 'bapak bapak', 'cewe sma', 'bocil epep', 'emak emak']
        let penumpang = penumpan[Math.floor(Math.random() * penumpan.length)]
    let nogo = ['mas mas', 'bapak bapak', 'cewe sma', 'bocil epep', 'emak emak']
        let nogorojo = penumpan[Math.floor(Math.random() * penumpan.length)]
    alya.level = global.db.users[m.sender]
      alya.fightnaga = alya.fightnaga ? alya.fightnaga : {}
      const delay = time => new Promise(res=>setTimeout(res,time));

      if (typeof alya.fightnaga[m.sender] != "undefined" && alya.fightnaga[m.sender] == true) return m.reply(`*Tidak bisa melakukan battle ⚔️ karena Arena yang kamu miliki dipakai untuk fight pet mu yg lain.*`)

      let users = participants.map(u => u.id)
      var lawan
    	lawan = users[Math.floor(users.length * Math.random())]
      while (typeof global.db.users[lawan] == "undefined" || lawan == m.sender){
        lawan = users[Math.floor(users.length * Math.random())]
      }

      let lamaPertarungan = Acakin(8,20)

      m.reply(`*Pet Kamu* (🐴centaur ${penumpang}) ⚔️menantang 🐴centaurnya *${nogorojo}* (🐴centaur kamu) lagi berkelahi.\n\nTunggu ${lamaPertarungan} menit lagi dan lihat siapa yg menang🎮.`)

      alya.fightnaga[m.sender] = true

      await delay(1000 * 60 * lamaPertarungan)

      let alasanKalah = ['Naikin lagi levelnya😐','Cupu','Kurang hebat','Ampas Petnya','Pet gembel']
      let alasanMenang = ['Hebat','Pro','Ganas Pet','Legenda Pet','Sangat Pro','Rajin Ngasi Makan Pet']

      let kesempatan = []
      for (i=0;i<global.db.users[m.sender].centaur;i++) kesempatan.push(m.sender)
      for (i=0;i<global.db.users[lawan].centaur;i++) kesempatan.push(lawan)

      let pointPemain = 0
      let pointLawan = 0
      for (i=0;i<10;i++){
        unggul = Acakin(0,kesempatan.length-1)
        if (kesempatan[unggul] == m.sender) pointPemain += 1
        else pointLawan += 1
      }

      if (pointPemain > pointLawan){
        let hadiah = (pointPemain - pointLawan) * 20000
        global.db.users[m.sender].money += hadiah
        global.db.users[m.sender].tiketcoin += 1
        m.reply(`*${alya.getName(m.sender)}* [${pointPemain * 10}] - [${pointLawan * 10}] *${alya.getName(lawan)}*\n\n*Pet🐴Kamu* (centaur ${global.db.users[m.sender].centaur}) MENANG melawan 🐴centaurnya *${alya.getName(lawan)}* (centaur ${global.db.users[lawan].centaur}) karena centaur🐴kamu ${alasanMenang[Acakin(0,alasanMenang.length-1)]}\n\nHadiah Rp. ${hadiah.toLocaleString()}\n+1 Tiketcoin`)
      }else if (pointPemain < pointLawan){
        let denda = (pointLawan - pointPemain) * 100000
        global.db.users[m.sender].money -= denda
        global.db.users[m.sender].tiketcoin += 1
        m.reply(`*${alya.getName(m.sender)}* [${pointPemain * 10}] - [${pointLawan * 10}] *${alya.getName(lawan)}*\n\n*Pet🐴Kamu* (centaur ${global.db.users[m.sender].centaur}) KALAH melawan 🐴centaurnya *${alya.getName(lawan)}* (centaur ${global.db.users[lawan].centaur}) karena pet kamu ${alasanKalah[Acakin(0,alasanKalah.length-1)]}\n\nUang kamu berkurang Rp. ${denda.toLocaleString()}\n+1 Tiketcoin`)
      }else {
        m.reply(`*${alya.getName(m.sender)}* [${pointPemain * 10}] - [${pointLawan * 10}] *${alya.getName(lawan)}*\n\nHasil imbang kak, ga dapet apa apa 😂`)
      }

      delete alya.fightnaga[m.sender]
  }
}
