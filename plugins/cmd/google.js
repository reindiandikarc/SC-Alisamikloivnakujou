// Plugin: google
// Auto-generated from Alya V12
// Commands: google

const path = require('path')

module.exports = {
  command: ["google"],
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

    if (!q) return replyalya(`Example : ${prefix + command} ${botname}`)
    reply(mess.wait)
    let google = require('google-it')
    google({'query': text}).then(res => {
    let teks = `Google Search From : ${text}\n\n`
    for (let g of res) {
    teks += `⭔ *Title* : ${g.title}\n`
    teks += `⭔ *Description* : ${g.snippet}\n`
    teks += `⭔ *Link* : ${g.link}\n\n────────────────────────\n\n`
    }
    replyalya(teks)
    })
  }
}
