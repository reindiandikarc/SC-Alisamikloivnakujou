// Plugin: suapsipir
// Auto-generated from Alya V12
// Commands: suapsipir

const path = require('path')

module.exports = {
  command: ["suapsipir"],
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
        let now = Date.now()

        let isJailKriminal = user.jailUntil && now < user.jailUntil
        let isJailBansos = user.lastbansos && now < user.lastbansos

        if (!isJailKriminal && !isJailBansos) return replyalya("🔍 Lu nggak lagi di penjara, bray. Mau nyogok siapa?")

        let penjaraAktif = Math.max((user.jailUntil || 0), (user.lastbansos || 0))
        let sisaWaktu = penjaraAktif - now
        let sisaMenit = Math.ceil(sisaWaktu / 60000)

        let dendaSogok = sisaMenit * 50000

        if (user.money < dendaSogok) return replyalya(`💸 Uangmu gak cukup! Butuh **Rp ${dendaSogok.toLocaleString('id-ID')}** buat nyogok sipir agar lu bebas sekarang.`)

        user.money -= dendaSogok
        user.jailUntil = 0
        user.lastbansos = 0 // Reset keduanya agar benar-benar bebas

        await replyalya(`💰 *TRANSAKSI BERHASIL* 💰\n\nSipir menerima uangmu (Rp ${dendaSogok.toLocaleString('id-ID')}). Lu bebas dari sel lewat pintu belakang. Hati-hati di jalan!`)
  }
}
