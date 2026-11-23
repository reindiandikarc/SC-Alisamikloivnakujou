// Plugin: liststicker
// Auto-generated from Alya V12
// Commands: liststicker

const path = require('path')

module.exports = {
  command: ["liststicker"],
  tags: ['sticker'],
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

    let teks = '┌──⭓「 *Sticker List* 」\n│\n'
    for (let x of AlyaSticker) {
    teks += `│⭔ ${x}\n`
    }
    teks += `│\n└────────────⭓\n\n*Totally there are : ${AlyaSticker.length}*`
    replyalya(teks)
  }
}
