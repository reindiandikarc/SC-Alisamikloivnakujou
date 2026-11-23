// Plugin: igstalk2
// Auto-generated from Alya V12
// Commands: igstalk2

const path = require('path')

module.exports = {
  command: ["igstalk2"],
  tags: ['info'],
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
    if (!q) return replyalya(`Example ${prefix+command} unicorn_xeon`)
    alya.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key }})
    const aj = await igstalk(`${q}`)
    alya.sendMessage(m.chat, { image: { url : aj.profile }, caption:
    `*/ Instagram Stalker \\*

    Full name : ${aj.fullname}
    Username : ${aj.username}
    Post : ${aj.post}
    Followers : ${aj.followers}
    Following : ${aj.following}
    Bio : ${aj.bio}` }, { quoted: m } )
  }
}
