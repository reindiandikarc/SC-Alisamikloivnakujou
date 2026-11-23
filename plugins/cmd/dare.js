// Plugin: dare
// Ported to Alya V13 from V10
// Commands: dare

const path = require('path')

module.exports = {
  command: ["dare"],
  tags: ['fun'],
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
      waifuList, husbuList, pler, setting, user,
      mentionByTag, mentionByReply, participants
    } = ctx

    const dare = [
      "Telepon gebetan/pacar sekarang dan kirim tangkapan layar di sini",
      "Ucapkan 'Selamat datang di Who Wants To Be a Millionaire!' ke semua grup yang kamu punya",
      "Telepon mantan dengan mengatakan rindu",
      "Nyanyikan chorus dari lagu terakhir yang kamu mainkan",
      "Pukul meja (yang ada di rumah) sampai kamu dimarahi karena berisik",
      "Sebutkan nama mantan",
      "Buat 1 sajak untuk anggota grup!",
      "Kirim daftar percakapan WhatsAppmu",
      "Ceritakan versimu sendiri tentang hal-hal memalukan",
      "Tag orang yang kamu benci",
      "Ubah nama menjadi *I AM DONKEY* selama 24 jam",
      "Teriak *ma chuda ma chuda* di depan rumahmu",
      "Ambil foto/potret pacar atau gebetanmu dan kirimkan di sini",
      "Ceritakan tipe pacar yang kamu sukai!",
      "Jadikan nama lengkapmu sebagai status selama 5 jam",
      "Buat video tari singkat tanpa filter hanya dengan musik dan unggah sebagai status selama 5 jam",
      "Telepon sahabatmu, omong kosong",
      "Jadikan foto dirimu tanpa filter sebagai status selama 10 menit",
      "Kirim pesan kepada mantanmu dan katakan bahwa kamu masih menyukainya",
      "Berkata kasar pada salah satu anggota grup di percakapan pribadi dan katakan 'kamu jelek, beban'",
      "Ucapkan 'KAMU CANTIK/GANTENG' pada salah satu orang yang ada di atas pinlistmu",
      "Kirim foto selfie yang memalukan sebagai foto profilmu",
      "Lakukan breakdance selama 30 detik di ruang tamu",
      "Ceritakan cerita sedih yang kamu ketahui",
      "Makan sepotong bawang putih mentah",
      "Tunjukkan lima orang terakhir yang kamu kirim pesan dan isi pesan mereka",
    ]

    const random = dare[Math.floor(Math.random() * dare.length)]
    replyalya(`⚖️ *DARE*\n\n🎯 ${random}`)
  }
}
