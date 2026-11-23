// Plugin: addsticker
// Auto-generated from Alya V12
// Commands: addsticker

const path = require('path')

module.exports = {
  command: ["addsticker"],
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
    if (args.length < 1) return replyalya('Whats the sticker name?')
    if (AlyaSticker.includes(q)) return replyalya("The name is already in use")
    let delb = await alya.downloadAndSaveMediaMessage(quoted)
    AlyaSticker.push(q)
    await fsx.copy(delb, `./data/AlyaMedia/sticker/${q}.webp`)
    fs.writeFileSync('./data/AlyaMedia/database/xeonsticker.json', JSON.stringify(AlyaSticker))
    fs.unlinkSync(delb)
    replyalya(`Success Adding Sticker\nCheck by typing ${prefix}liststicker`)
  }
}
