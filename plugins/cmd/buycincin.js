// Plugin: buycincin
// Auto-generated from Alya V12
// Commands: buycincin

const path = require('path')

module.exports = {
  command: ["buycincin"],
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

        let users = global.db.users[m.sender]
        const RING_PRICE = 5000000

        if (users.money < RING_PRICE) return replyalya(`💸 Uang lu nggak cukup. Harga Cincin Nikah itu Rp ${RING_PRICE.toLocaleString()}! Kerja dulu sana.`)

        users.money -= RING_PRICE
        users.inventory ??= {}
        users.inventory.cincin = (users.inventory.cincin || 0) + 1

        replyalya(`💍 *BERHASIL BELI CINCIN*\n\nSaldo berkurang Rp ${RING_PRICE.toLocaleString()}\nSekarang lu punya *${users.inventory.cincin}* Cincin Nikah di tas.`)
  }
}
