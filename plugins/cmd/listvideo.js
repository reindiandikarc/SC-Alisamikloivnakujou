// Plugin: listvideo
// Auto-generated from Alya V12
// Commands: listvideo

const path = require('path')

module.exports = {
  command: ["listvideo"],
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

    let teks = '┌──⭓「 *Video List* 」\n│\n'
    for (let x of VideoAlya) {
    teks += `│⭔ ${x}\n`
    }
    teks += `│\n└────────────⭓\n\n*Totally there are : ${VideoAlya.length}*`
    replyalya(teks)
  }
}
