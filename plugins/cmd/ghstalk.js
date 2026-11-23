// Plugin: ghstalk
// Auto-generated from Alya V12
// Commands: ghstalk

const path = require('path')

module.exports = {
  command: ["ghstalk"],
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
    if (!q) return replyalya(`Example ${prefix+command} DGXeon`)
    alya.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key }})
    aj = await githubstalk.githubstalk(`${q}`)
    alya.sendMessage(m.chat, { image: { url : aj.profile_pic }, caption:
    `*/ Github Stalker \\*

    Username : ${aj.username}
    Nickname : ${aj.nickname}
    Bio : ${aj.bio}
    Id : ${aj.id}
    Nodeid : ${aj.nodeId}
    Url Profile : ${aj.profile_pic}
    Url Github : ${aj.url}
    Type : ${aj.type}
    Admin : ${aj.admin}
    Company : ${aj.company}
    Blog : ${aj.blog}
    Location : ${aj.location}
    Email : ${aj.email}
    Public Repo : ${aj.public_repo}
    Public Gists : ${aj.public_gists}
    Followers : ${aj.followers}
    Following : ${aj.following}
    Created At : ${aj.ceated_at}
    Updated At : ${aj.updated_at}` }, { quoted: m } )
    }
    //=================================================
  }
