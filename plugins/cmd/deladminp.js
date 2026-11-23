// Plugin: deladminp
// Auto-generated from Alya V12
// Commands: deladminp

const path = require('path')

module.exports = {
  command: ["deladminp"],
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

    if (!Ryuu && !isPT && !isOwn) return replyalya(mess.only.owner)
    if (!args[0]) return replyalya(`Use ${prefix+command} nomor\nExample ${prefix+command} 6283166570663`)
    ya = q.split("|")[0].replace(/[^0-9]/g, '')+`@s.whatsapp.net`
    unp = adminp.indexOf(ya)
    adminp.splice(unp, 1)
    fs.writeFileSync('./database/adminpanel.json', JSON.stringify(adminp))
    replyalya(`The Number ${ya} Has Been Removed Admin Panel!`)
  }
}
