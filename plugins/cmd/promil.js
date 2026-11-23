// Plugin: promil
// Family System V1 - Program Hamil (pengganti konsep .hbwaifu, non-eksplisit)
// Commands: promil

const path = require('path')

module.exports = {
  command: ["promil", "programhamil"],
  tags: ['family'],
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

    const punyaWaifu = users.waifu && users.waifu.name
    const punyaHusbu = users.husbu && users.husbu.name

    if (!punyaWaifu && !punyaHusbu) {
      return replyalya("😔 Lu belum nikah. Nikah dulu pakai *.marry* sebelum mikirin momongan~")
    }

    // Cek sudah punya anak yang masih dalam proses kehamilan
    users.family ??= {}
    users.family.children ??= []
    users.family.pregnancy ??= null

    if (users.family.pregnancy && users.family.pregnancy.isPregnant) {
      return replyalya(`🤰 Istri/suami lu lagi hamil sekarang! Sabar nunggu waktunya lahiran ya. Cek progress kehamilan pakai *.ngidam*.`)
    }

    // Cooldown biar gak spam roll setiap detik
    users.family.lastPromil ??= 0
    let cooldownPromil = 24 * 60 * 60 * 1000 // 24 jam
    let timeLapse = Date.now() - users.family.lastPromil
    if (timeLapse < cooldownPromil) {
      let sisaJam = Math.ceil((cooldownPromil - timeLapse) / (60 * 60 * 1000))
      return replyalya(`⏳ Sabar dulu, program hamil cuma bisa dicoba sekali sehari. Coba lagi dalam ${sisaJam} jam.`)
    }

    users.family.lastPromil = Date.now()

    const pasangan = punyaWaifu ? users.waifu.name : users.husbu.name
    const chance = 0.25
    const berhasil = Math.random() < chance

    if (berhasil) {
      users.family.pregnancy = {
        isPregnant: true,
        startedAt: Date.now(),
        cravingsAnswered: 0,
        partnerName: pasangan
      }

      let teks = `🌸 *KABAR BAHAGIA!* 🌸\n\n`
      teks += `Setelah berikhtiar dan berdoa, akhirnya momen yang ditunggu datang juga!\n`
      teks += `*${pasangan}* dinyatakan positif hamil! 🤰✨\n\n`
      teks += `Selamat ya @${m.sender.split('@')[0]}, sebentar lagi bakal jadi orang tua!\n`
      teks += `Jangan lupa perhatian sama kebutuhan istri/suami lu, cek apa yang dia inginkan lewat *.ngidam*.\n\n`
      teks += `⏳ Masa kehamilan berlangsung 9 jam (ibaratkan 9 bulan kehamilan).`

      return alya.sendMessage(m.chat, { text: teks, mentions: [m.sender] }, { quoted: m })
    } else {
      let gagalText = [
        "Belum rezeki kali ini, coba lagi besok ya.",
        "Dokter bilang masih perlu usaha lebih, sabar ya.",
        "Belum berhasil bulan ini, jangan menyerah!",
        "Kali ini belum berhasil, tapi jangan patah semangat."
      ]
      let randomGagal = gagalText[Math.floor(Math.random() * gagalText.length)]
      return replyalya(`😢 *Belum Berhasil*\n\n${randomGagal}\n\nLu bisa coba program hamil lagi besok dengan *.promil*.`)
    }
  }
}
