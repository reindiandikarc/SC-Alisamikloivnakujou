// Plugin: fact
// Ported to Alya V13 from V10
// Commands: fact

const path = require('path')
const axios = require('axios')

module.exports = {
  command: ["fact"],
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

    try {
      const { data } = await axios.get('https://nekos.life/api/v2/fact')
      replyalya(`💡 *Fact:* ${data.fact}`)
    } catch (e) {
      // Fallback facts if API fails
      const facts = [
        "Semut bisa mengangkat beban 50 kali lebih berat dari tubuhnya.",
        "Lebah madu bisa terbang sejauh 88.000 km untuk menghasilkan 1 kg madu.",
        "Ubur-ubur sudah ada sebelum dinosaurus – mereka sudah ada selama lebih dari 500 juta tahun.",
        "Sebuah siput dapat tidur selama 3 tahun.",
        "Otot mata adalah otot yang paling aktif di tubuh manusia.",
        "Koala memiliki sidik jari yang hampir identik dengan sidik jari manusia.",
        "Gurita memiliki tiga jantung dan darah berwarna biru.",
        "Kucing menghabiskan 70% hidupnya untuk tidur.",
        "Air dapat mendidih dan membeku pada waktu yang sama – ini disebut Triple Point.",
        "DNA dalam satu sel tubuh manusia, jika direntangkan, panjangnya bisa mencapai 2 meter.",
      ]
      replyalya(`💡 *Fact:* ${facts[Math.floor(Math.random() * facts.length)]}`)
    }
  }
}
