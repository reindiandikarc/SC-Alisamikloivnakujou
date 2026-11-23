// Plugin: downvote
// Auto-generated from Alya V12
// Commands: downvote

const path = require('path')

module.exports = {
  command: ["downvote"],
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

                if (!m.isGroup) return replytolak(mess.only.group)
                if (!(m.chat in vote)) return replyalya(`_*no voting in this group!*_\n\n*${prefix}vote* - to start voting`)
                isVote = vote[m.chat][1].concat(vote[m.chat][2])
                wasVote = isVote.includes(m.sender)
                if (wasVote) return replyalya('You have Voted')
                vote[m.chat][2].push(m.sender)
                menvote = vote[m.chat][1].concat(vote[m.chat][2])
                teks_vote = `* VOTE *

    *Reason:* ${vote[m.chat][0]}

    ┌〔 UPVOTE 〕
    │
    ├ Total: ${vote[m.chat][1].length}
    ${vote[m.chat][1].map((v, i) => `├ ${i + 1}. @${v.split`@`[0]}`).join('\n')}
    │
    └────

    ┌〔 DOWNVOTE 〕
    │
    ├ Total: ${vote[m.chat][2].length}
    ${vote[m.chat][2].map((v, i) => `├ ${i + 1}. @${v.split`@`[0]}`).join('\n')}
    │
    └────

    Please Type Below
    *${prefix}upvote* - to upvote
    *${prefix}downvote* -  to downvote
    *${prefix}deletevote* - to delete vote`
                alya.sendMessage(m.chat, {text: teks_vote, mentions: menvote}, {quoted:m})
  }
}
