// Plugin: npmstalk
// Auto-generated from Alya V12
// Commands: npmstalk

const path = require('path')

module.exports = {
  command: ["npmstalk"],
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

      reply(mess.wait)
    if (!q) return replyalya(`Example ${prefix+command} xeonapi`)
    reply(mess.wait)
    eha = await npmstalk.npmstalk(q)
    replyalya(`*/ Npm Stalker \\*

    Name : ${eha.name}
    Version Latest : ${eha.versionLatest}
    Version Publish : ${eha.versionPublish}
    Version Update : ${eha.versionUpdate}
    Latest Dependencies : ${eha.latestDependencies}
    Publish Dependencies : ${eha.publishDependencies}
    Publish Time : ${eha.publishTime}
    Latest Publish Time : ${eha.latestPublishTime}`)
    }
  }
