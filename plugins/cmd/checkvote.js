// Plugin: checkvote
// Auto-generated from Alya V12
// Commands: checkvote

const path = require('path')

module.exports = {
  command: ["checkvote"],
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

    if (!m.isGroup) return replytolak(mess.only.group)
    if (!(m.chat in vote)) return replyalya(`_*no voting in this group!*_\n\n*${prefix}vote* - to start voting`)
    teks_vote = `* VOTE *

    *Reason:* ${vote[m.chat][0]}

    ┌〔 UPVOTE 〕
    │
    ├ Total: ${upvote.length}
    ${vote[m.chat][1].map((v, i) => `├ ${i + 1}. @${v.split`@`[0]}`).join('\n')}
    │
    └────

    ┌〔 DOWNVOTE 〕
    │
    ├ Total: ${devote.length}
    ${vote[m.chat][2].map((v, i) => `├ ${i + 1}. @${v.split`@`[0]}`).join('\n')}
    │
    └────

    *${prefix}deletevote* - to delete votes


    ©${alya.user.id}
    `
    alya.sendTextWithMentions(m.chat, teks_vote, m)
//     		case 'deletevote': case 'delvote': case 'hapusvote': {
                if (!m.isGroup) return replytolak(mess.only.group)
                if (!(m.chat in vote)) return replyalya(`_*no voting in this group!*_\n\n*${prefix}vote* - to start voting`)
                delete vote[m.chat]
                replyalya('Successfully Deleted Vote Session In This Group')
  }
}
