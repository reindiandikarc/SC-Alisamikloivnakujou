// Plugin: delsticker
// Auto-generated from Alya V12
// Commands: delsticker

const path = require('path')

module.exports = {
  command: ["delsticker"],
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

    if (!Ryuu) return replytolak(mess.only.owner)
    if (args.length < 1) return replyalya('Enter the sticker name')
    if (!AlyaSticker.includes(q)) return replyalya("The name does not exist in the database")
    let wanu = AlyaSticker.indexOf(q)
    AlyaSticker.splice(wanu, 1)
    fs.writeFileSync('./data/AlyaMedia/database/xeonsticker.json', JSON.stringify(AlyaSticker))
    fs.unlinkSync(`./data/AlyaMedia/sticker/${q}.webp`)
    replyalya(`Success deleting sticker ${q}`)
  }
}
