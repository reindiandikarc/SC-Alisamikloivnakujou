// Plugin: kencanwaifu
// Auto-generated from Alya V12
// Commands: kencanwaifu

const path = require('path')

module.exports = {
  command: ["kencanwaifu"],
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

        let users = global.db.users[m.sender]
        if (!users.waifu || !users.waifu.name) return replyalya("😔 Lu masih jomblo bray! Nikahin waifu dulu di *.gachawaifu* > *.marriwaifu*.")

        const KENCAN_WAIFU_PRICE = 200000
        if (users.money < KENCAN_WAIFU_PRICE) return replyalya(`💸 Uang lu kurang buat ngajak kencan! Butuh Rp ${KENCAN_WAIFU_PRICE.toLocaleString()} buat nraktir dia.`)

        users.lastKencanWaifu ??= 0
        let cdW = 3600000 // 1 jam
        let tlW = Date.now() - users.lastKencanWaifu
        if (tlW < cdW) {
            let sisaW = Math.ceil((cdW - tlW) / 60000)
            return replyalya(`⏳ Waifu lu masih capek dari kencan sebelumnya. Tunggu *${sisaW} menit* lagi ya sabar~`)
        }

        users.money -= KENCAN_WAIFU_PRICE
        users.lastKencanWaifu = Date.now()

        users.waifu.affection ??= 0
        let affGainW = Math.floor(Math.random() * 41) + 10  // 10–50
        users.waifu.affection += affGainW

        const kataManisWaifu = [
            "Kamu tau nggak sih, senyummu itu bisa bikin hari-hariku jadi lebih cerah dari matahari ☀️",
            "Aku nggak butuh bintang di langit, karena mata kamu udah cukup buat aku nyasar 🌟",
            "Kalau cinta itu adalah penyakit, aku nggak mau sembuh karena kamu yang jadi obatnya 💊",
            "Setiap detik bareng kamu tuh kayak bonus level di game, nggak rela buat di-skip 🎮",
            "Kamu tuh kayak wi-fi gratis, ke mana-mana aku selalu cari kamu duluan 📶",
            "Dunia boleh chaos, tapi selama ada kamu di sisi aku, semua terasa damai 🌸",
            "Aku bisa nyasar seharian asal ujungnya ketemu kamu di sini 🗺️",
            "Kamu tahu nggak, bibir kamu itu bentuknya persis kayak jawaban dari semua pertanyaan aku 🥺",
            "Tiap ketemu kamu, jantung aku kayak skip satu beat — apa itu namanya kalau bukan cinta? 💓",
            "Kalau aku boleh milih tempat ternyaman di dunia, aku milih ada di sampingmu 🤍",
            "Wajah kamu tuh ilegal, bikin aku susah fokus ngapa-ngapain selain natap kamu terus 🫣",
            "Aku mau jalan jauh asal ujungnya bareng kamu, bahkan kalau itu ke ujung dunia sekalipun 🌍",
            "Kamu itu bukan cuma waifu terbaik, kamu adalah alasan aku bangun pagi dengan semangat 🌄",
            "Denger suara tawa kamu tuh candu banget, sekali denger langsung pengen dengerin terus selamanya 🎶",
            "Nggak perlu banyak kata, karena kehadiranmu aja udah cukup bikin hidupku lengkap 💖"
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

        const endingList = [
            "💋 Kamu Dicium Di Pipi, lalu kamu merah padam malu sendiri hehe",
            "🫂 Kamu Berpelukan Hangat dengannya sampai lupa waktu",
            "🍡 Kamu di kasih Jajan sama dia, manis banget kayak orangnya",
            "😤 Karena kamu bikin badmod di akhir, dia pergi duluan dengan ngambek",
            "🎮 Pergi ke rumahnya lalu Mabar bareng sampai subuh 👀"
        ]

        let randomKata = kataManisWaifu[Math.floor(Math.random() * kataManisWaifu.length)]
        let randomTempat = tempatKencan[Math.floor(Math.random() * tempatKencan.length)]
        let randomEnding = endingList[Math.floor(Math.random() * endingList.length)]

        let teksW = `╔══════════════════════════╗\n`
        teksW += `║    ✨ *KENCAN RESULT* ✨    ║\n`
        teksW += `╚══════════════════════════╝\n\n`
        teksW += `🎉 Cieee cieee ada pasangan muda mudi baru nih, WHEN YAH 😆\n`
        teksW += `Aku tunjukkin hasilnya ya xixi~\n\n`
        teksW += `✦━━━━━━━━━━━━━━━━━━━━━━━✦\n\n`
        teksW += `Pada saat kencan, kamu berhasil menggoda\n`
        teksW += `💗 *${users.waifu.name}* *(${users.waifu.anime || 'Unknown'})*\n\n`
        teksW += `Kamu melontarkan kalimat ⁠ ◜‿◝ ⁠♡\n`
        teksW += `_"${randomKata}"_\n\n`
        teksW += `Lalu... Waifu kamu malu-malu saat menerima gombalanmu 😖\n`
        teksW += `*"D-d-dasar kamu ini bikin aku gemes aja deh hehe 😖"*\n\n`
        teksW += `✦━━━━━━━━━━━━━━━━━━━━━━━✦\n\n`
        teksW += `🌸 *Affection:* +${affGainW} (Total: ${users.waifu.affection})\n`
        teksW += `📺 *Tempat:* ${randomTempat}\n`
        teksW += `💸 *Biaya Kencan:* Rp ${KENCAN_WAIFU_PRICE.toLocaleString()}\n`
        teksW += `🏆 *ENDING:* ${randomEnding}\n\n`
        teksW += `╔══════════════════════════╗\n`
        teksW += `║  💕 *Semoga makin lengket!*  ║\n`
        teksW += `╚══════════════════════════╝`

        replyalya(teksW)
    }

    // ============================================================
    //  💙 KENCAN HUSBU  — .kencanhusbu
    // ============================================================
  }
