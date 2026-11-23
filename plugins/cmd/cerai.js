// Plugin: cerai
// Ported to Alya V13 from V10
// Commands: cerai, divorce

const path = require('path')

module.exports = {
  command: ["cerai", "divorce"],
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

    let users = global.db.users[m.sender]
    if (!users.waifu || !users.waifu.name) return replyalya("Mau cerai sama siapa? Istri aja nggak punya.")

    const CERAI_FINE = 1000000
    if (users.money < CERAI_FINE) return replyalya(`💸 Lu miskin banget, biaya admin pengadilan agama (cerai) itu Rp ${CERAI_FINE.toLocaleString()}. Gak bisa cerai!`)

    let mantan = users.waifu.name
    users.money -= CERAI_FINE
    users.waifu = {}

    replyalya(`💔 *RESMI BERCERAI*\n\nLu resmi pisah sama *${mantan}*.\nDenda cerai Rp ${CERAI_FINE.toLocaleString()} dipotong dari saldo lu. Sekarang lu jomblo lagi!`)
  }
}
