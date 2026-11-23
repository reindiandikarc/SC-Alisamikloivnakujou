// Plugin: marry2
// Auto-generated from Alya V12
// Commands: marry2

const path = require('path')

module.exports = {
  command: ["marry2"],
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
        users.inventory ??= {}

        if (!users.lastGacha) return replyalya("⚠️ Belum milih waifu! Pilih dulu di *.pilihwaifu <nomor>*, terus baru lamar.")
        if (users.waifu && users.waifu.name) return replyalya(`🚫 Lu udah nikah sama *${users.waifu.name}*! Cerai dulu baru bisa nikah lagi.`)
        if (!users.inventory.cincin || users.inventory.cincin < 1) return replyalya("❌ Lu butuh *1 Cincin Nikah* buat melamar. Beli di *.buycincin* dulu!")

        let istri = users.lastGacha
        users.inventory.cincin -= 1
        users.waifu = {
            name: istri.name,
            anime: istri.anime,
            rarity: istri.rarity,
            marriedAt: Date.now()
        }
        delete users.lastGacha

        let teks = `🎉 *PERNIKAHAN SAH!* 🎉\n\n`
        teks += `Selamat! @${m.sender.split('@')[0]} resmi menikah dengan *${istri.name}*.\n`
        teks += `Mahar 1 unit Cincin Nikah telah dibayarkan tunai!\n\n`
        teks += `Semoga langgeng terus sama waifu pilihan hati ya bray! 💍`

        alya.sendMessage(m.chat, { text: teks, mentions: [m.sender] }, { quoted: m })
  }
}
