// Plugin: getsession
// Auto-generated from Alya V12
// Commands: getsession

const path = require('path')

module.exports = {
  command: ["getsession"],
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

    if (!Ryuu) return replytolak(mess.only.owner)
    replyalya('Tunggu sebentar, saat ini sedang mengambil file sesi Anda')
    let sesi = await fs.readFileSync('./Alyachan/creds.json')
    alya.sendMessage(m.chat, {
    document: sesi,
    mimetype: 'application/json',
    fileName: 'creds.json'
    }, {
    quoted: m
    })
  }
}
