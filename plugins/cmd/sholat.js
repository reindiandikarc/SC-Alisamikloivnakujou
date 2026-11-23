// Plugin: sholat
// Auto-generated from Alya V12
// Commands: waktusholat, sholat

const path = require('path')

module.exports = {
  command: ["waktusholat", "sholat"],
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

    try {
        if (!text) return replyalya(`📌 Masukkan nama kota!\nContoh: *${prefix + command} Surabaya*`)

        let kota = text.trim()

        await alya.sendMessage(m.chat, { react: { text: "🕌", key: m.key } })

        function toMinutes(time) {
            if (!time) return 0
            let [h, m2] = time.split(':')
            return parseInt(h) * 60 + parseInt(m2)
        }

        let imsak, subuh, terbit, dhuha, dzuhur, ashar, maghrib, isya, tanggalStr, kotaStr
        let hijriStr = ''
        let usedApi = ''

        // === PRIMARY: api.vreyn.web.id (dari Marin Kitagawa) ===
        try {
            const resVreyn = await axios.get(`https://api.vreyn.web.id/api/search/jadwalsholat?kota=${encodeURIComponent(kota)}`, { timeout: 10000 })
            const d = resVreyn.data
            if (!d || !d.result) throw new Error('Data tidak tersedia')
            kotaStr = d.city || kota
            tanggalStr = d.result.tanggal || '-'
            imsak    = d.result.imsak    || '-'
            subuh    = d.result.subuh    || '-'
            terbit   = d.result.terbit   || '-'
            dhuha    = d.result.dhuha    || '-'
            dzuhur   = d.result.dzuhur   || '-'
            ashar    = d.result.ashar    || '-'
            maghrib  = d.result.maghrib  || '-'
            isya     = d.result.isya     || '-'
            usedApi = 'vreyn'
        } catch (_e1) {
            // === FALLBACK: api.aladhan.com (dari Alya original) ===
            try {
                const resAladhan = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(kota)}&country=Indonesia&method=11`)
                const jsonAl = await resAladhan.json()
                if (!jsonAl.data) throw new Error('Kota tidak ditemukan')
                const t = jsonAl.data.timings
                const tgl = jsonAl.data.date.gregorian
                const hij = jsonAl.data.date.hijri
                kotaStr   = kota
                tanggalStr = `${tgl.day} ${tgl.month.en} ${tgl.year}`
                hijriStr  = `${hij.day} ${hij.month.en} ${hij.year} H`
                imsak   = t.Imsak
                subuh   = t.Fajr
                terbit  = t.Sunrise
                dhuha   = '-'
                dzuhur  = t.Dhuhr
                ashar   = t.Asr
                maghrib = t.Maghrib
                isya    = t.Isha
                usedApi = 'aladhan'
            } catch (_e2) {
                return replyalya(`❌ Kota *${kota}* tidak ditemukan atau API sedang gangguan.\nCoba kota lain ya~`)
            }
        }

        // Hitung sholat berikutnya
        const now = new Date()
        const wib = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }))
        const jam = String(wib.getHours()).padStart(2, '0')
        const menit = String(wib.getMinutes()).padStart(2, '0')
        const waktuSekarang = `${jam}:${menit}`
        const nowMinutes = toMinutes(waktuSekarang)

        const waktuList = [
            { nama: "Subuh",   jam: subuh   },
            { nama: "Dzuhur",  jam: dzuhur  },
            { nama: "Ashar",   jam: ashar   },
            { nama: "Maghrib", jam: maghrib },
            { nama: "Isya",    jam: isya    }
        ]

        let nextSholat = "Subuh"
        let nextTime = subuh
        for (let w of waktuList) {
            if (w.jam !== '-' && nowMinutes < toMinutes(w.jam)) {
                nextSholat = w.nama
                nextTime = w.jam
                break
            }
        }

        let diff = toMinutes(nextTime) - nowMinutes
        if (diff < 0) diff += 1440
        const sisaJam = Math.floor(diff / 60)
        const sisaMenit = diff % 60

        const teks = `
    ╭━━〔 🕌 *JADWAL SHOLAT* 〕━━⬣
    ┃ 📍 Kota      : *${kotaStr.toUpperCase()}*
    ┃ 📅 Tanggal   : ${tanggalStr}${hijriStr ? `\n┃ 🌙 Hijriyah  : ${hijriStr}` : ''}
    ┃ 🕒 Sekarang  : ${waktuSekarang} WIB
    ╰━━━━━━━━━━━━━━━━⬣

    🕋 *Sholat Berikutnya:* ${nextSholat} (${nextTime})
    ⏳ Dalam *${sisaJam} jam ${sisaMenit} menit* lagi

    ┏━━━〔 WAKTU SHOLAT 〕━━━⬣
    🌙 Imsak    : ${imsak} WIB
    🌅 Subuh    : ${subuh} WIB
    ☀️ Terbit   : ${terbit} WIB
    🌤 Dhuha    : ${dhuha} WIB
    🌞 Dzuhur   : ${dzuhur} WIB
    🌄 Ashar    : ${ashar} WIB
    🌇 Maghrib  : ${maghrib} WIB
    🌙 Isya     : ${isya} WIB
    ┗━━━━━━━━━━━━━━━━━━⬣

    ✨ _Semoga ibadahmu lancar hari ini_ 🤲
    📡 Sumber: Kemenag RI
    `.trim()

        await alya.sendMessage(m.chat, { text: teks }, { quoted: m })
        await alya.sendMessage(m.chat, { react: { text: "✅", key: m.key } })

    } catch (err) {
        console.error('jadwalsholat error:', err)
        reply("❌ Gagal mengambil jadwal sholat")
    }
  }
}
