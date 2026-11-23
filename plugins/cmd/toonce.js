// Plugin: toonce
// Auto-generated from Alya V12
// Commands: toonce

const path = require('path')

module.exports = {
  command: ["toonce"],
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

    if (!quoted) return replyalya(`Reply Image/Video`)
    alya.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key }})
    if (/image/.test(mime)) {
    anuan = await alya.downloadAndSaveMediaMessage(quoted)
    alya.sendMessage(m.chat, {image: {url:anuan}, caption: `Ini dia!!`, fileLength: "999", viewOnce : true},{quoted: m })
    } else if (/video/.test(mime)) {
    anuanuan = await alya.downloadAndSaveMediaMessage(quoted)
    alya.sendMessage(m.chat, {video: {url:anuanuan}, caption: `Ini dia!!`, fileLength: "99999999", viewOnce : true},{quoted: m })
    }
  }
}
