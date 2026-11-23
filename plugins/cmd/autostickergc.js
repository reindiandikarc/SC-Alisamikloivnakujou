// Plugin: autostickergc
// Auto-generated from Alya V12
// Commands: autostickergc

const path = require('path')

module.exports = {
  command: ["autostickergc"],
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

    if (!isAdmins && !Ryuu) return reply('Khusus Admin!!')
    if (args.length < 1) return replyalya('type auto sticker on to enable\ntype auto sticker off to disable')
    if (args[0]  === 'on'){
    if (isAutoSticker) return replyalya(`Already activated`)
    autosticker.push(from)
    fs.writeFileSync('./database/autosticker.json', JSON.stringify(autosticker))
    replyalya('autosticker activated')
    } else if (args[0] === 'off'){
    let anuticker1 = autosticker.indexOf(from)
    autosticker.splice(anuticker1, 1)
    fs.writeFileSync('./database/autosticker.json', JSON.stringify(autosticker))
    replyalya('auto sticker deactivated')
  }
}
}
