// Plugin: searchfriend
// Auto-generated from Alya V12
// Commands: friend, searchfriend

const path = require('path')

module.exports = {
  command: ["friend", "searchfriend"],
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

    alya.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key }})
    let teman = pickRandom(alyaverifikasiuser)
    setTimeout(() => {
    }, 1000)
    setTimeout(() => {
    replyalya('Berhasil Mendapatkan Satu Orang')
    }, 5000)
    setTimeout(() => {
    alya.sendMessage(from, {text: `Di Sini @${teman.split("@")[0]}`, mentions: [teman]}, { quoted : m })
    }, 9000)
  }
}
