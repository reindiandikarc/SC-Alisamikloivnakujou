// Plugin: kencanhusbu
// Auto-generated from Alya V12
// Commands: kencanhusbu

const path = require('path')

module.exports = {
  command: ["kencanhusbu"],
  tags: ['romance'],
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

        let users = global.global.db.users[m.sender]
        if (!users.husbu || !users.husbu.name) return replyalya("😔 Lu belum punya husbu! Nikah dulu di *.gachahusbu* > *.marrihusbu*.")

        const KENCAN_HUSBU_PRICE = 200000
        if (users.money < KENCAN_HUSBU_PRICE) return replyalya(`💸 Uang lu kurang buat kencan sama husbu! Butuh Rp ${KENCAN_HUSBU_PRICE.toLocaleString()} buat nraktir dia.`)

        users.lastKencanHusbu ??= 0
        let cdH = 3600000 // 1 jam
        let tlH = Date.now() - users.lastKencanHusbu
        if (tlH < cdH) {
            let sisaH = Math.ceil((cdH - tlH) / 60000)
            return replyalya(`⏳ Husbu lu masih capek dari kencan sebelumnya. Tunggu *${sisaH} menit* lagi ya beb~`)
        }

        users.money -= KENCAN_HUSBU_PRICE
        users.lastKencanHusbu = Date.now()

        users.husbu.affection ??= 0
        let affGainH = Math.floor(Math.random() * 41) + 10  // 10–50
        users.husbu.affection += affGainH

        const kataManisHusbu = [
            "Kamu tau nggak sih, senyummu itu bisa bikin hari-hariku jadi lebih cerah dari matahari ☀️",
            "Aku nggak butuh bintang di langit, karena mata kamu udah cukup buat aku nyasar 🌟",
            "Kalau cinta itu adalah penyakit, aku nggak mau sembuh karena kamu yang jadi obatnya 💊",
            "Setiap detik bareng kamu tuh kayak bonus level di game, nggak rela buat di-skip 🎮",
            "Kamu tuh kayak wi-fi gratis, ke mana-mana aku selalu cari kamu duluan 📶",
            "Dunia boleh chaos, tapi selama ada kamu di sisi aku, semua terasa damai 🌸",
            "Aku bisa nyasar seharian asal ujungnya ketemu kamu di sini 🗺️",
            "Kamu tahu nggak, senyum kamu itu bentuknya persis kayak jawaban dari semua pertanyaan aku 🥺",
            "Tiap ketemu kamu, jantung aku kayak skip satu beat — apa itu namanya kalau bukan cinta? 💓",
            "Kalau aku boleh milih tempat ternyaman di dunia, aku milih ada di sampingmu 🤍",
            "Kamu tuh nggak boleh sesempurna ini, bikin aku susah fokus ngapa-ngapain selain natap kamu 🫣",
            "Aku mau jalan jauh asal ujungnya bareng kamu, bahkan kalau itu ke ujung dunia sekalipun 🌍",
            "Kamu itu bukan cuma husbu terbaik, kamu adalah alasan aku bangun pagi dengan semangat 🌄",
            "Denger suara tawa kamu tuh candu banget, sekali denger langsung pengen dengerin terus selamanya 🎶",
            "Nggak perlu banyak kata, karena kehadiranmu aja udah cukup bikin hidupku lengkap 💙"
        ]

        const tempatKencan = [
            "🛍️ Mall",
            "🎡 Taman Hiburan",
            "📚 Perpustakaan Kota",
            "🎬 Bioskop",
            "🌳 Taman Kota",
            "🍣 Restoran Jepang",
            "🎨 Museum Seni",
            "🏖️ Pantai",
            "🌄 Bukit Bintang",
            "🎠 Pasar Malam",
            "🏫 Sekolahan (Nostalgia!)",
            "🍦 Ice Cream Park",
            "🎤 Karaoke",
            "⛲ Taman Bunga",
            "🎳 Bowling Center"
        ]

        const endingListH = [
            "💋 Kamu Dicium Di Pipi sama dia, lalu kamu merah padam malu sendiri hehe",
            "🫂 Kamu Berpelukan Hangat dengannya sampai lupa waktu",
            "🍡 Kamu di kasih Jajan sama dia, manis banget kayak orangnya",
            "😤 Karena kamu bikin badmod di akhir, dia pergi duluan dengan ngambek",
            "🎮 Pergi ke rumahnya lalu Mabar bareng sampai subuh 👀"
        ]

        let randomKataH = kataManisHusbu[Math.floor(Math.random() * kataManisHusbu.length)]
        let randomTempatH = tempatKencan[Math.floor(Math.random() * tempatKencan.length)]
        let randomEndingH = endingListH[Math.floor(Math.random() * endingListH.length)]

        let teksH = `╔══════════════════════════╗\n`
        teksH += `║    ✨ *KENCAN RESULT* ✨    ║\n`
        teksH += `╚══════════════════════════╝\n\n`
        teksH += `🎉 Cieee cieee ada pasangan muda mudi baru nih, WHEN YAH 😆\n`
        teksH += `Aku tunjukkin hasilnya ya xixi~\n\n`
        teksH += `✦━━━━━━━━━━━━━━━━━━━━━━━✦\n\n`
        teksH += `Pada saat kencan, kamu berhasil menggoda\n`
        teksH += `💙 *${users.husbu.name}* *(${users.husbu.anime || 'Unknown'})*\n\n`
        teksH += `Kamu melontarkan kalimat ⁠ ◜‿◝ ⁠♡\n`
        teksH += `_"${randomKataH}"_\n\n`
        teksH += `Lalu... Husbu kamu malu-malu saat menerima gombalanmu 😖\n`
        teksH += `*"D-d-dasar kamu ini bikin aku gemes aja deh hehe 😖"*\n\n`
        teksH += `✦━━━━━━━━━━━━━━━━━━━━━━━✦\n\n`
        teksH += `💙 *Affection:* +${affGainH} (Total: ${users.husbu.affection})\n`
        teksH += `📺 *Tempat:* ${randomTempatH}\n`
        teksH += `💸 *Biaya Kencan:* Rp ${KENCAN_HUSBU_PRICE.toLocaleString()}\n`
        teksH += `🏆 *ENDING:* ${randomEndingH}\n\n`
        teksH += `╔══════════════════════════╗\n`
        teksH += `║  💙 *Semoga makin lengket!*  ║\n`
        teksH += `╚══════════════════════════╝`

        replyalya(teksH)
  }
}
