// Plugin: truth
// Ported to Alya V13 from V10
// Commands: truth

const path = require('path')

module.exports = {
  command: ["truth"],
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

    const truth = [
      "Pernahkah kamu menyukai seseorang? Berapa lama?",
      "Apa ketakutan terbesar kamu?",
      "Pernahkah kamu mengambil uang dari ayah atau ibumu? Alasannya?",
      "Apa yang membuatmu bahagia saat sedang sedih?",
      "Pernahkah kamu memiliki perasaan cinta satu arah? Jika ya kepada siapa?",
      "Pernah menjadi selingkuhan seseorang?",
      "Hal paling ditakuti?",
      "Siapa orang yang paling berpengaruh dalam hidupmu?",
      "Siapa yang paling mendekati tipe pasangan idamanmu di sini?",
      "Pernahkah kamu menolak seseorang? Alasan mengapa?",
      "Kapan terakhir kali kamu sangat marah? Mengapa?",
      "Apakah kamu memiliki bakat tersembunyi? Apa sajakah itu?",
      "Hal terakhir apa yang kamu cari di Google?",
      "Apa hal paling menakutkan yang pernah terjadi padamu?",
      "Pernahkah kamu kentut dan menyalahkannya kepada orang lain?",
      "Kapan terakhir kali kamu membuat orang lain menangis?",
      "Pernahkah kamu melihat mayat?",
      "Anggota keluargamu yang paling mengganggumu dan mengapa?",
      "Pernahkah kamu berpura-pura sakit untuk pulang dari sekolah?",
      "Apa barang paling memalukan di dalam kamarmu?",
      "Pernahkah kamu tertawa begitu keras hingga pipismu basah?",
      "Apakah kamu mencium bau kentutmu sendiri?",
      "Apa kesalahan terbesar yang pernah kamu buat?",
      "Pernahkah kamu mencontek dalam ujian?",
      "Kapan terakhir kali kamu menangis?",
      "Di antara orang tua kamu, siapa yang kamu cintai paling?",
      "Siapa pujaan hati kamu saat masa sekolah dulu?",
      "Apakah kamu punya pacar? Apa ketakutan terbesarmu?",
      "Apakah kamu menyukai seseorang dalam grup ini? Jika ya, siapa?",
      "Apa hal terburuk yang pernah kamu lakukan?",
    ]

    const random = truth[Math.floor(Math.random() * truth.length)]
    replyalya(`⚖️ *TRUTH*\n\n❓ ${random}`)
  }
}
