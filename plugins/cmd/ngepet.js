// Plugin: ngepet
// Auto-generated from Alya V12
// Commands: ngepet

const path = require('path')

module.exports = {
  command: ["ngepet"],
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
        if (!user) return replyalya('Daftar dulu lah bray, ketik .daftar biar legal! 📄')

        const COOLDOWN = 60 * 60 * 1000
        const JAIL_TIME = 5 * 60 * 60 * 1000
        const now = Date.now()

        if (now < (user.jailUntil || 0)) {
            let sisaMenit = Math.ceil((user.jailUntil - now) / 60000)
            return replyalya(`👮 *LU MASIH DI SEL!* \nMuka lu masih bonyok digebukin warga. Sabar, ${sisaMenit} menit lagi baru bebas!`)
        }

        if (now - (user.lastNgepet || 0) < COOLDOWN) {
            let sisa = COOLDOWN - (now - user.lastNgepet)
            let menit = Math.floor(sisa / 60000)
            return replyalya(`🕯️ *RITUAL BELUM SIAP!* \nLilin lu masih sumbu pendek. Tunggu *${menit} menit* lagi biar aura mistisnya mateng!`)
        }

        user.lastNgepet = now
        const delay = (ms) => new Promise(res => setTimeout(res, ms))

        let { key } = await alya.sendMessage(m.chat, { text: '🐷 *NGUIIIIKK!* Tubuh lu menciut, idung lu jadi pesek... Lu resmi jadi babi ngepet. Ritual dimulai! 🕯️' }, { quoted: m })
        await delay(4000)

        let progress = 0
        let multiplier = 1
        let statusKritis = false

        const phases = [
            { msg: "Mulai masuk kawasan elit Menteng... 🏘️", risk: 0.05 },
            { msg: "Lagi gesek-gesek dinding di rumah Sultan... 💸", risk: 0.10 },
            { msg: "Waduh! Ada anjing pitbull lepas, lu dikejar sampe masuk got! 🐕", risk: 0.15 },
            { msg: "Partner lu panik! Lilinnya goyang kena angin... 🕯️💨", risk: 0.20 },
            { msg: "Lagi nyoba kabur lewat lobang pagar... 🏃‍♂️", risk: 0.05 }
        ]

        for (let i = 0; i < phases.length; i++) {
            progress += 20
            let bar = "⬛".repeat(progress / 10) + "⬜".repeat(10 - (progress / 10))

            if (Math.random() < phases[i].risk) {
                statusKritis = true
                await alya.sendMessage(m.chat, {
                    text: `🌑 *PROSES RITUAL:* ${progress}%\n[${bar}]\n\n⚠️ *BAHAYA:* ${phases[i].msg}\n\n*STATUS:* Lu terpojok! Warga mulai bawa obor!`,
                    edit: key
                })
            }

            await alya.sendMessage(m.chat, {
                text: `🌑 *PROSES RITUAL:* ${progress}%\n[${bar}]\n\n💬 ${phases[i].msg}`,
                edit: key
            })
            await delay(4000)
        }

        if (statusKritis) {
            let denda = Math.floor(Math.random() * 30000) + 20000
            user.money = Math.max(0, user.money - denda)
            user.jailUntil = now + JAIL_TIME

            return await alya.sendMessage(m.chat, {
                text: `💀 *MAMPUS! KETANGKEP BASAH!*\n\n❌ *Nasib:* Lu berubah jadi manusia pas lagi di dalem sarung warga. Digebukin massa sampe bonyok!\n\n💸 *Denda Medis:* -Rp${denda.toLocaleString()}\n⛓️ *Hukuman:* Penjara 5 Jam\n💰 *Sisa Saldo:* Rp${user.money.toLocaleString()}`,
                edit: key
            })
        }

        const hoki = Math.random()

        if (hoki > 0.30) {

            let hasil = Math.floor(Math.random() * 150000 + 100000)
            user.money += hasil
            await alya.sendMessage(m.chat, {
                text: `💰 *RITUAL SUKSES!* 🐷\n\nLu berhasil balik ke kandang tepat waktu sebelum lilin mati. \n\n📈 *Hasil:* +Rp${hasil.toLocaleString()}\n🕯️ *Partner:* Jago jaga lilinnya!\n💰 *Total Saldo:* Rp${user.money.toLocaleString()}\n\n_Mending duitnya buat beli bakso daripada buat beli tumbal lagi!_`,
                edit: key
            })
        } else {
            await alya.sendMessage(m.chat, {
                text: `💨 *ZONK!* 📉\n\nLu berhasil balik dengan selamat, tapi ternyata rumah yang lu gesek itu rumah orang yang lagi terlilit pinjol. Isinya cuma surat tagihan semua!\n\n💰 *Saldo Tetap:* Rp${user.money.toLocaleString()}\n\n_Capek doang jadi babi, mending turu bray._`,
                edit: key
            })
        }
    }
//     	case 'livefunfact':
  }
