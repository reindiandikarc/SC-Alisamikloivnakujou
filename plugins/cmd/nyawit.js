// Plugin: nyawit
// Auto-generated from Alya V12
// Commands: nyawit

const path = require('path')

module.exports = {
  command: ["nyawit"],
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

        let userAlt = global.db.users[m.sender]
        if (!user) return reply('Daftar dulu lah bub, ketik .daftar biar legal! 📄')

        const cooldown = 5 * 60 * 1000
        const now = Date.now()

        if (now - (userAlt.lastNyawit || 0) < cooldown) {
            let sisa = cooldown - (now - userAlt.lastNyawit)
            let menit = Math.floor(sisa / 60000)
            let detik = Math.floor((sisa % 60000) / 1000)
            return reply(`🛑 *SABAR BOSQUE!* \nLagi nunggu bibitnya tumbuh nih. Balik lagi *${menit}m ${detik}d* lagi ya, mending ngopi dulu! ☕`)
        }

        userAlt.lastNyawit = now
        const delay = (ms) => new Promise(res => setTimeout(res, ms))

        let { key } = await alya.sendMessage(m.chat, { text: '🚜 *Nyawit?? GASKEUN!* Lagi otw nyari lahan sawit nih... 💨' }, { quoted: m })
        await delay(4000)

        let progress = 0
        let isFailed = false
        let multiplier = 1

        const phases = [
            "Lagi tebas semak belukar... 🌿",
            "Nanam bibit unggul dari Thailand... 🌱",
            "Kasih pupuk biar buahnya segede gaban... 🧪",
            "Lagi nunggu truk pengangkut dateng... 🚛",
            "Proses timbang di pabrik CPO... ⚖️"
        ]

        for (let i = 0; i < phases.length; i++) {
            if (isFailed) break

            progress += 20
            let bar = "▓".repeat(progress / 10) + "░".repeat(10 - (progress / 10))
            let eventMsg = ""
            let eventChance = Math.random()

            if (eventChance < 0.25) {
                let participants = Object.keys(global.db.users).filter(v => v !== m.sender && global.db.users[v].registered)
                if (participants.length > 0) {
                    let target = participants[Math.floor(Math.random() * participants.length)]
                    let sabotageEvents = [
                        { m: `🥷 *MUNCUL PENYELUNDUP!* @${target.split('@')[0]} nyoba nyolong pupuk lu!`, penalty: 0.2 },
                        { m: `👺 *PREMAN LOKAL!* @${target.split('@')[0]} minta jatah preman di lahan.`, penalty: 0.3 }
                    ]
                    let ev = sabotageEvents[Math.floor(Math.random() * sabotageEvents.length)]
                    eventMsg = `\n\n${ev.m}`
                    multiplier -= ev.penalty

                    await alya.sendMessage(m.chat, { text: `🎬 *PROGRESS NYAWIT:* ${progress}%\n[${bar}]\n\n💬 ${phases[i]}${eventMsg}`, edit: key, mentions: [target] })
                    await delay(5000)
                }
            }
            else if (eventChance < 0.25) {
                const badEvents = [
                    { m: "⚠️ *WADUH!* Ban traktor bocor, nambah waktu dikit...", delay: 6000 },
                    { m: "⛈️ *BADAI!* Lahan banjir, progres agak macet...", delay: 7000 },
                    { m: "🐗 *HAMA!* Ada babi hutan masuk lahan, usir dulu!", delay: 8000 }
                ]
                let ev = badEvents[Math.floor(Math.random() * badEvents.length)]
                eventMsg = `\n\n${ev.m}`
                await delay(ev.delay)
            }

            else if (eventChance > 0.92) {
                eventMsg = `\n\n✨ *HOKI!* Dapet bantuan pupuk subsidi, makin gacor!`
                multiplier += 0.5
            }

            await alya.sendMessage(m.chat, {
                text: `🎬 *PROGRESS NYAWIT:* ${progress}%\n[${bar}]\n\n💬 ${phases[i]}${eventMsg}`,
                edit: key
            })

            if (Math.random() < 0.05) {
                isFailed = true
                const failReason = [
                    "Lahan lu digrebek warga karena ilegal! 👮‍♂️",
                    "Kebakaran hutan, semua sawit lu ludes! 🔥",
                    "Bibit lu ternyata palsu, cuma numbuh rumput! 🤡"
                ]
                let reason = failReason[Math.floor(Math.random() * failReason.length)]
                const denda = Math.floor(Math.random() * 15000) + 5000
                userAlt.money = Math.max(0, userAlt.money - denda)

                return await alya.sendMessage(m.chat, {
                    text: `💀 *CHOS! GAGAL TOTAL...*\n\n❌ *Penyebab:* ${reason}\n💸 *Kerugian:* -Rp${denda.toLocaleString()}\n💰 *Sisa Saldo:* Rp${userAlt.money.toLocaleString()}`,
                    edit: key
                })
            }

            await delay(3000)
        }

        const hoki = Math.random()
        let cuan = 0
        let finalText = ""

        if (hoki > 0.35) {
            cuan = Math.floor((Math.random() * 50000 + 30000) * multiplier)

            if (Math.random() < 0.08) {
                let participants = Object.keys(global.db.users).filter(v => v !== m.sender && global.db.users[v].registered)
                let thief = participants[Math.floor(Math.random() * participants.length)]
                let stolen = Math.floor(cuan * 0.5)

                userAlt.money += (cuan - stolen)
                global.db.users[thief].money = (global.db.users[thief].money || 0) + stolen

                finalText = `💸 *PANEN DIRAMPOK!* 😱\n\n` +
                            `Pas lagi mau bongkar muat, @${thief.split('@')[0]} dateng bawa komplotan!\n` +
                            `💰 *Cuan Bersih:* +Rp${(cuan - stolen).toLocaleString()}\n` +
                            `🥷 *Dimaling:* -Rp${stolen.toLocaleString()}\n` +
                            `💰 *Total Saldo:* Rp${userAlt.money.toLocaleString()}\n\n` +
                            `_Lapor polisi gih, atau bales dendam pas dia Nyawit!_`

                return await alya.sendMessage(m.chat, { text: finalText, edit: key, mentions: [thief] })
            }

            userAlt.money += cuan
            finalText = `✅ *HASIL TIMBANGAN KELUAR!* 💰\n\n` +
                        `📈 *Cuan:* +Rp${cuan.toLocaleString()}\n` +
                        `⭐ *Bonus/Penalty Multiplier:* x${multiplier.toFixed(1)}\n` +
                        `💰 *Total Saldo:* Rp${userAlt.money.toLocaleString()}\n\n` +
                        `_Buset, auto jadi Sultan Sawit ini mah!_ 🤙🔥`
        } else {
            let rugi = Math.floor(Math.random() * 20000) + 5000
            userAlt.money = Math.max(0, userAlt.money - rugi)
            finalText = `💸 *DUH, TEKOR!* 📉\n\n` +
                        `❌ *Masalah:* Harga CPO dunia lagi anjlok parah.\n` +
                        `📉 *Potongan:* -Rp${rugi.toLocaleString()}\n` +
                        `💰 *Sisa Saldo:* Rp${userAlt.money.toLocaleString()}\n\n` +
                        `_Sabar bos, mending rakit PC aja kalo gini._`
        }

        await alya.sendMessage(m.chat, { text: finalText, edit: key })
  }
}
