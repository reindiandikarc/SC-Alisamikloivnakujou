// Plugin: sabung
// Auto-generated from Alya V12
// Commands: sabung

const path = require('path')

module.exports = {
  command: ["sabung"],
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

        let u = global.db.users[m.sender]
        let bet = parseInt(args[0])

        if (!bet || bet < 300000)
            return replyalya('❌ Minimal taruhan 300.000')

        if (u.money < bet)
            return replyalya('💸 Uangmu tidak cukup')

        let id = m.sender
        alya.misi = alya.misi || {}

        if (id in alya.misi)
            return replyalya('⚠️ Kamu masih dalam sesi sabung! Tunggu selesai dulu.')

        alya.misi[id] = true

        try {

        u.money -= bet

        const delay = (ms) => new Promise(res => setTimeout(res, ms))
        const stepDelay = 7000

        let winChance = 0.35
        let eventRoll = Math.random()
        let eventText = ''

        const steps = [
            '🐔 SABUNG AYAM DIMULAI!\n\n🏟️ Arena sedang disiapkan...',
            '🐔 SABUNG AYAM DIMULAI!\n\n⚔️ Kedua ayam dilepas ke arena...',
            '🐔 SABUNG AYAM DIMULAI!\n\n💨 Ayam saling menyerang brutal!'
        ]

        if (eventRoll < 0.15) {
            winChance -= 0.2
            eventText = '🚨 POLISI MASUK ARENA!\nChance menang menurun!'
        } else if (eventRoll < 0.35) {
            winChance += 0.2
            eventText = '🎉 PENONTON BERSORAK!\nAyammu semakin brutal!'
        } else if (eventRoll < 0.5) {
            eventText = '🔥 AYAMU MENGAMUK!\nSerangan makin ganas!'
        }

        if (eventText) {
            steps.push(`🐔 SABUNG AYAM DIMULAI!\n\n${eventText}`)
        }

        steps.push('🐔 SABUNG AYAM DIMULAI!\n\n🎯 Serangan terakhir...')

        let sent = await alya.sendMessage(m.chat, {
            text: steps[0]
        }, { quoted: m })

        for (let i = 1; i < steps.length; i++) {
            await delay(stepDelay)
            await alya.sendMessage(m.chat, {
                text: steps[i],
                edit: sent.key
            })
        }

        await delay(stepDelay)

        let roll = Math.random()
        let hasilText = ''

        if (roll < 0.05) {
            let hasil = bet * 5
            u.money += hasil
            hasilText = `🚀 JACKPOT!!!\nAyammu membunuh ayam lawan!\n\n💰 +Rp${hasil.toLocaleString()}`
        } else if (roll > 0.95) {
            hasilText = `💀 AYAMU MATI DI ARENA!\n\n💸 -Rp${bet.toLocaleString()}`
        } else {
            let win = Math.random() < winChance
            if (win) {
                let hasil = bet * 2
                u.money += hasil
                hasilText = `🏆 AYAMU MENANG!\n\n💰 +Rp${hasil.toLocaleString()}`
            } else {
                hasilText = `❌ AYAMU KALAH!\n\n💸 -Rp${bet.toLocaleString()}`
            }
        }

        await alya.sendMessage(m.chat, {
            text: `🐔 HASIL SABUNG AYAM\n\n${hasilText}\n\n💰 Saldo sekarang: Rp${u.money.toLocaleString()}`,
            edit: sent.key
        })

        } catch (e) {
            console.error(e)
            replyalya('❌ Terjadi kesalahan saat sabung ayam')
        } finally {
            delete alya.misi[id]
        }
  }
}
