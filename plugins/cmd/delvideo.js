// Plugin: delvideo
// Auto-generated from Alya V12
// Commands: delvideo

const path = require('path')

module.exports = {
  command: ["delvideo"],
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
    if (args.length < 1) return replyalya('Enter the video name')
    if (!VideoAlya.includes(q)) return replyalya("The name does not exist in the database")
    let wanu = VideoAlya.indexOf(q)
    VideoAlya.splice(wanu, 1)
    fs.writeFileSync('./data/AlyaMedia/database/xeonvideo.json', JSON.stringify(VideoAlya))
    fs.unlinkSync(`./data/AlyaMedia/video/${q}.mp4`)
    replyalya(`Success deleting video ${q}`)
  }
}
