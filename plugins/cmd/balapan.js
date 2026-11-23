// Plugin: balapan
// Auto-generated from Alya V12
// Commands: balapan

const path = require('path')

module.exports = {
  command: ["balapan"],
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

      const delay = (ms) => new Promise(res => setTimeout(res, ms))
      const stepDelay = 5000

      const sub = args[0]
      let userAlt = global.db.users[m.sender]
      if (!userAlt) return replyalya('User tidak ditemukan')

      userAlt.money ??= 0
      userAlt.motor ??= 'Beat'
      userAlt.nitro ??= 0
      userAlt.balapanWin ??= 0
      userAlt.balapanLose ??= 0
      userAlt.wanted ??= 0
      userAlt.hospitalUntil ??= 0

    const motors = {
        Beat: { speed: 1, price: 0 },
        Vario: { speed: 1.2, price: 500000 },
        Ninja: { speed: 1.5, price: 2000000 },
        R1: { speed: 2, price: 5000000 },
        ZX10R: { speed: 2.5, price: 15000000 },
        H2R: { speed: 3.5, price: 50000000 },
        DucatiV4: { speed: 4, price: 125000000 },
        Hayabusa: { speed: 4.5, price: 250000000 },
      }

      if (!sub) {
        return m.reply(`
    🏁 *BALAPAN LIAR*

    🚦 .balapan open <taruhan>
    🏎️ .balapan terima
    ❌ .balapan batal
    🏍️ .balapan beli
    ⚙️ .balapan nitro
    🏆 .balapan rank
    📊 .balapan stats

    Motor: ${userAlt.motor}
    Nitro: ${userAlt.nitro}
    Wanted: ${userAlt.wanted}
    `)
      }

      if (sub === 'beli') {
        let type = args[1]

        if (!type) {
          let list = '🏍️ *DAFTAR MOTOR TERSEDIA*\n\n'
          Object.keys(motors).forEach(m => {
            list += `• ${m}\n`
            list += `   💰 Harga: ${motors[m].price.toLocaleString()}\n`
            list += `   ⚡ Speed: x${motors[m].speed}\n\n`
          })
          list += `Motor kamu sekarang: ${userAlt.motor}`
          return replyalya(list)
        }

        if (!motors[type])
          return replyalya('❌ Motor tidak tersedia. Ketik .balapan beli untuk lihat daftar.')

        if (userAlt.motor === type)
          return replyalya('🏍️ Kamu sudah memakai motor ini')

        if (userAlt.money < motors[type].price)
          return replyalya('💸 Uang tidak cukup')

        userAlt.money -= motors[type].price
        userAlt.motor = type

        return replyalya(`🏍️ Berhasil beli ${type}\n💰 Sisa uang: ${userAlt.money.toLocaleString()}`)
      }

      if (sub === 'nitro') {
        const cost = 200000
        if (userAlt.money < cost) return replyalya('💸 Uang tidak cukup')

        userAlt.money -= cost
        userAlt.nitro += 1
        return replyalya(`⚙️ Nitro berhasil dibeli (+1)\nNitro kamu: ${userAlt.nitro}`)
      }

      if (sub === 'open') {
        if (alya.openBalapan)
          return replyalya('❌ Masih ada balapan aktif')

        let bet = parseInt(args[1])
        if (!bet || bet < 100000)
          return replyalya('❌ Minimal taruhan 100.000')

        if (userAlt.money < bet)
          return replyalya('💸 Uang tidak cukup')

        alya.openBalapan = {
          creator: m.sender,
          bet,
          taken: false,
          timeout: setTimeout(() => {
            alya.openBalapan = null
            m.reply('⌛ Balapan expired')
          }, 30000)
        }

        return m.reply(`🏁 OPEN BALAPAN\n💰 Taruhan: ${bet.toLocaleString()}\nBalas: .balapan terima`)
      }

      if (sub === 'batal') {
        let race = alya.openBalapan
        if (!race) return replyalya('❌ Tidak ada balapan')
        if (m.sender !== race.creator)
          return replyalya('❌ Hanya pembuat yang bisa batal')

        clearTimeout(race.timeout)
        alya.openBalapan = null
        return replyalya('❌ Balapan dibatalkan')
      }

      if (sub === 'terima') {
        let race = alya.openBalapan
        if (!race) return replyalya('❌ Tidak ada balapan open')
        if (m.sender === race.creator)
          return replyalya('❌ Tidak bisa lawan diri sendiri')

        let A = global.db.users[race.creator]
        let B = user

        if (Date.now() < userAlt.hospitalUntil)
          return replyalya('🏥 Kamu masih di rumah sakit')

        if (A.money < race.bet || B.money < race.bet)
          return replyalya('💸 Salah satu uang tidak cukup')

        clearTimeout(race.timeout)

        A.money -= race.bet
        B.money -= race.bet

        let sent = await alya.sendMessage(m.chat, {
          text: `🏁 BALAPAN DIMULAI\n${alya.getName(race.creator)} 🆚 ${alya.getName(m.sender)}`
        }, { quoted: m })

        const steps = [
          '🚦 Lampu hijau!',
          '🏍️ Gas pol!',
          '🔥 Nitro menyala!',
          '⚔️ Saling salip!',
          '🏁 Garis finish terlihat!'
        ]

        for (let s of steps) {
          await delay(stepDelay)
          await alya.sendMessage(m.chat, { text: s, edit: sent.key })
        }

        await delay(stepDelay)

        let powerA = motors[A.motor].speed + (A.nitro * 0.3) + Math.random()
        let powerB = motors[B.motor].speed + (B.nitro * 0.3) + Math.random()

        let crash = Math.random() < 0.1
        let razia = Math.random() < (0.1 + (A.wanted + B.wanted) * 0.05)

        if (crash) {
          B.hospitalUntil = Date.now() + (10 * 60 * 1000)
          await alya.sendMessage(m.chat, {
            text: `💥 CRASH!\n${alya.getName(m.sender)} masuk RS 10 menit`,
            edit: sent.key
          })
          alya.openBalapan = null
        }

        if (razia) {
          await alya.sendMessage(m.chat, {
            text: `🚓 RAZIA POLISI!\nTaruhan hangus`,
            edit: sent.key
          })
          alya.openBalapan = null
        }

        let winner = powerA > powerB ? A : B
        let prize = race.bet * 2

        winner.money += prize
        winner.balapanWin++
        winner.wanted++

        await alya.sendMessage(m.chat, {
          text: `🏆 PEMENANG: ${winner === A ? alya.getName(race.creator) : alya.getName(m.sender)}\n💰 Hadiah: ${prize.toLocaleString()}`,
          edit: sent.key
        })

        alya.openBalapan = null
      }

      if (sub === 'rank') {
        let sorted = Object.entries(global.db.users)
          .filter(([id,u]) => u.balapanWin)
          .sort((a,b) => b[1].balapanWin - a[1].balapanWin)
          .slice(0,5)

        let text = '🏆 RANK BALAPAN\n\n'
        sorted.forEach((v,i)=>{
          text += `${i+1}. ${alya.getName(v[0])} - ${v[1].balapanWin} win\n`
        })

        return replyalya(text || 'Belum ada data')
      }

      if (sub === 'stats') {
        return replyalya(`
    📊 STATS BALAPAN

    🏍️ Motor: ${userAlt.motor}
    🏆 Win: ${userAlt.balapanWin}
    💀 Lose: ${userAlt.balapanLose}
    ⚙️ Nitro: ${userAlt.nitro}
    🚨 Wanted: ${userAlt.wanted}
    `)
      }

    }
    //==================================================================
  }
