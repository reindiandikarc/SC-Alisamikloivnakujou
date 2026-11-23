// Plugin: divorce
// Fixed for V13: tambah alias cerai, support waifu & husbu
// Commands: divorce, cerai

const path = require('path')

module.exports = {
  command: ["divorce", "cerai"],
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
        const CERAI_FINE = 1000000

        // Smart cerai: if user punya husbu tapi gak punya waifu, cerai husbu
        let punyaWaifu = users.waifu && users.waifu.name
        let punyaHusbu = users.husbu && users.husbu.name

        if (!punyaWaifu && !punyaHusbu) return replyalya("Mau cerai sama siapa? Lu masih jomblo!")

        if (!punyaWaifu && punyaHusbu) {
            // Cerai husbu
            if (users.money < CERAI_FINE) return replyalya(`💸 Lu miskin banget, biaya admin pengadilan agama (cerai) itu Rp ${CERAI_FINE.toLocaleString()}. Gak bisa cerai!`)
            let mantan = users.husbu.name
            users.money -= CERAI_FINE
            users.husbu = {}
            return replyalya(`💔 *RESMI BERCERAI*\n\nLu resmi pisah sama *${mantan}*.\nDenda cerai Rp ${CERAI_FINE.toLocaleString()} dipotong dari saldo lu. Sekarang lu jomblo lagi!`)
        }

        // Default: cerai waifu
        if (users.money < CERAI_FINE) return replyalya(`💸 Lu miskin banget, biaya admin pengadilan agama (cerai) itu Rp ${CERAI_FINE.toLocaleString()}. Gak bisa cerai!`)
        let mantan = users.waifu.name
        users.money -= CERAI_FINE
        users.waifu = {}

        replyalya(`💔 *RESMI BERCERAI*\n\nLu resmi pisah sama *${mantan}*.\nDenda cerai Rp ${CERAI_FINE.toLocaleString()} dipotong dari saldo lu. Sekarang lu jomblo lagi!`)
  }
}
