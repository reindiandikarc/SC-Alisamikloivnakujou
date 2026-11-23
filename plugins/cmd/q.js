// Plugin: q
// Auto-generated from Alya V12
// Commands: q

const path = require('path')

module.exports = {
  command: ["q"],
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

    if (!m.quoted) return replyalya('Reply the Message!!')
    let xeonquotx= await alya.serializeM(await m.getQuotedObj())
    if (!xeonquotx.quoted) return replyalya('Pesan yang Anda balas tidak dikirim oleh bot')
    await xeonquotx.quoted.copyNForward(m.chat, true)
  }
}
