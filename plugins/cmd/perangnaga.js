// Plugin: perangnaga
// Auto-generated from Alya V12
// Commands: fightnaga, perangnaga

const path = require('path')

module.exports = {
  command: ["fightnaga", "perangnaga"],
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

        let userAlt = global.db.users[m.sender]

        if (!user.naga || user.naga == 0) return replyalya(`⚠️ Kamu tidak memiliki Naga untuk bertarung!`)
        if (user.health < 50) return replyalya(`❤️ Health naga kamu terlalu rendah (min. 50). Heal dulu!`)

        alya.fightnaga = alya.fightnaga ? alya.fightnaga : {}
        if (alya.fightnaga[m.sender]) return replyalya(`*Battle sedang berlangsung!* ⚔️ Tunggu sampai naga kamu kembali ke kandang.`)

        let participants = await alya.groupMetadata(m.chat).then(v => v.participants.map(a => a.id))
        let usersInDb = Object.keys(global.db.users)
        let potentialLawan = participants.filter(id => usersInDb.includes(id) && id !== m.sender)

        if (potentialLawan.length === 0) return replyalya(`❌ Tidak ada lawan yang sepadan di grup ini.`)
        let lawanId = potentialLawan[Math.floor(Math.random() * potentialLawan.length)]
        let lawan = global.db.users[lawanId]
        let lawanNagaLevel = lawan.naga || Math.floor(Math.random() * 5) + 1

        alya.fightnaga[m.sender] = true
        let lamaPertarungan = Math.floor(Math.random() * (60 - 30 + 1)) + 30 // 30-60 Detik

        await replyalya(`*\`🐉 DRAGON ARENA 🐉\`*

    *Naga Kamu* (Lv. ${user.naga}) VS *Naga ${alya.getName(lawanId)}* (Lv. ${lawanNagaLevel})

    Sedang bertarung sengit di angkasa... 🌪️
    Tunggu *${lamaPertarungan} detik* untuk melihat hasilnya!`)

        await new Promise(res => setTimeout(res, 1000 * lamaPertarungan))
        let totalPower = user.naga + lawanNagaLevel
        let chance = Math.random() * totalPower

        const alasanKalah = ['Naga kamu kurang lincah menghindari semburan api', 'Sayap naga kamu kelelahan', 'Lawan menggunakan teknik rahasia', 'Naga kamu kurang gizi', 'Naga kamu tertidur saat duel']
        const alasanMenang = ['Naga kamu mengeluarkan napas api legendaris', 'Manuver udara yang sangat pro', 'Sangat ganas dan tak terkalahkan', 'Naga kamu sedang dalam mode berserk', 'Kekuatan persahabatan naga']

        if (chance > lawanNagaLevel) {
            let hadiah = user.naga * 15000
            user.money += hadiah
            user.tiketcoin += 1
            userAlt.exp += 500

            await replyalya(`*\`🏆 VICTORY - DRAGON FIGHT \`*

    *${alya.getName(m.sender)}* ⚔️ *${alya.getName(lawanId)}*

    Naga kamu (Lv. ${user.naga}) Berhasil membakar lawan!
    *Komentar:* "${alasanMenang[Math.floor(Math.random() * alasanMenang.length)]}"

    💰 Hadiah: *Rp. ${hadiah.toLocaleString()}*
    ✨ Exp: *+500*
    🎫 Tiketcoin: *+1*`)

        } else if (chance < (lawanNagaLevel * 0.8)) { // Memberi sedikit ruang untuk imbang
            let denda = user.naga * 10000
            user.money -= denda
            user.health -= 20

            await replyalya(`*\`💀 DEFEAT - DRAGON FIGHT \`*

    *${alya.getName(m.sender)}* ⚔️ *${alya.getName(lawanId)}*

    Naga kamu terkapar di tanah karena ${alasanKalah[Math.floor(Math.random() * alasanKalah.length)]}.

    💸 Denda: *Rp. ${denda.toLocaleString()}*
    💔 Health: *-20*`)

        } else {
            await replyalya(`*\`🤝 DRAW - DRAGON FIGHT \`*

    Kedua naga sama-sama kuat dan memutuskan untuk berhenti bertarung. Tidak ada hadiah maupun denda.`)
        }

        delete alya.fightnaga[m.sender]
  }
}
