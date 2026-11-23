// Plugin: dapurmbg
// Auto-generated from Alya V12
// Commands: dapurmbg

const path = require('path')

module.exports = {
  command: ["dapurmbg"],
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

    const db = global.db
        let userAlt = db.users[m.sender]
        if (!user) return reply('Daftar dulu lah bub, ketik .daftar biar legal! 📄')

        const cooldown = 15 * 60 * 1000
        const now = Date.now()

        if (now - (userAlt.lastMbg || 0) < cooldown) {
            let sisa = cooldown - (now - userAlt.lastMbg)
            let menit = Math.floor(sisa / 60000)
            let detik = Math.floor((sisa % 60000) / 1000)
            return reply(`🏛️ *BIROKRASI MACET!* \nDuitnya masih dipake buat beli tiket jet pribadi ke USA. Balik lagi *${menit}m ${detik}d* lagi! ✈️`)
        }

        userAlt.lastMbg = now
        const delay = (ms) => new Promise(res => setTimeout(res, ms))

        let { key } = await alya.sendMessage(m.chat, { text: '🍱 *TENDER MBG (MAKAN BARENG GENG):* \nSedang memanipulasi data gizi dan anggaran... 📑' }, { quoted: m })
        await delay(6000)

        let progress = 0
        let multiplier = 1.0
        let currentIssue = ""

        const phases = [
            { p: "Memilih vendor catering (Milik keponakan sendiri biar aman)... 🤫", icon: "🤝" },
            { p: "Sunat massal anggaran: Dari 15rb jadi 3rb per porsi... ✂️", icon: "💰" },
            { p: "Inovasi menu: Nasi putih + Kerupuk putih + Kuah Bening (Oksigen)... 🍛", icon: "🧪" },
            { p: "Sesi dokumentasi: Sewa Chef hotel buat masak 1 porsi (buat difoto doang)... 📸", icon: "🤡" },
            { p: "Distribusi: Makanan dilempar ke sekolah pake truk sampah biar hemat... 🚚", icon: "🗑️" }
        ]

        for (let i = 0; i < phases.length; i++) {
            progress += 20
            let bar = "🍱".repeat(progress / 20) + "🔘".repeat(5 - (progress / 20))

            let eventChance = Math.random()
            let eventMsg = ""

            if (eventChance < 0.30) {
                const events = [
                    { m: "\n\n⚠️ *WADUH!* Ada wartawan nanya 'Mana susunya?', buru-buru beli susu sachet eceran!", mult: -0.2, issue: "Skandal Susu Sachet" },
                    { m: "\n\n✨ *HOKI!* Dapet restu dari dinas pusat karena vendornya 'Keluarga Mulyono', anggaran naik!", mult: 0.8, issue: "Privilese Keluarga" },
                    { m: "\n\n🤢 *KRITIS!* Satu kelas mual-mual karena telurnya ternyata telur replika dari plastik!", mult: -0.5, issue: "Telur Plastik Viral" }
                ]
                let ev = events[Math.floor(Math.random() * events.length)]
                eventMsg = ev.m
                multiplier += ev.mult
                currentIssue = ev.issue
                await delay(9000)
            }

            await alya.sendMessage(m.chat, {
                text: `${phases[i].icon} *PROYEK MBG:* ${progress}%\n[${bar}]\n\n💬 ${phases[i].p}${eventMsg}`,
                edit: key
            })
            await delay(4000)
        }

        const hoki = Math.random()
        let totalCuan = Math.floor((Math.random() * 150000 + 80000) * multiplier)

        if (hoki > 0.4) {

            let successReason = multiplier > 1.5
                ? "Anggaran berhasil dimark-up habis-habisan tanpa ketahuan KPK! Kamu resmi jadi pengusaha kebal hukum."
                : "Proyek selesai! Walaupun anak-anak cuma makan nasi garem, yang penting laporan di meja menteri terlihat estetik.";

            userAlt.money += totalCuan
            await alya.sendMessage(m.chat, {
                text: `✅ *PROYEK CAIR! (LOGIKA ORANG DALAM)* 💰\n\n` +
                       `📈 *Hasil Korupsi:* +Rp${totalCuan.toLocaleString()}\n` +
                       `⭐ *Multiplier:* x${multiplier.toFixed(1)}\n` +
                       `📝 *Alasan:* ${successReason}\n\n` +
                       `💰 *Total Saldo:* Rp${userAlt.money.toLocaleString()}\n\n` +
                       `_Buset, auto beli mobil Rubicon buat jemput selingkuhan!_ 🚙💨`,
                edit: key
            })
        } else {

            let failReason = currentIssue !== ""
                ? `Proyek hancur gara-gara *${currentIssue}*! Kamu dipanggil Komisi III buat pura-pura nangis di depan kamera.`
                : "Dana proyek ludes dipake main Slot oleh oknum admin catering!";

            let denda = Math.floor(Math.random() * 50000) + 20000
            userAlt.money = Math.max(0, userAlt.money - denda)

            await alya.sendMessage(m.chat, {
                text: `💀 *TAMAT RIWAYATMU! (KENA OTT)*\n\n` +
                       `❌ *Status:* TERSANGKA UTAMA\n` +
                       `⚠️ *Penyebab:* ${failReason}\n` +
                       `💸 *Kerugian:* -Rp${denda.toLocaleString()}\n` +
                       `💰 *Sisa Saldo:* Rp${userAlt.money.toLocaleString()}\n\n` +
                       `_Sabar ya, mending kabur ke Singapura sebelum paspor dicekal!_ ✈️🇸🇬`,
                edit: key
            })
        }
  }
}
