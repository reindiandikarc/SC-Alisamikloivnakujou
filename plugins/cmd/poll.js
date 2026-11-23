// Plugin: poll
// Auto-generated from Alya V12
// Commands: poll

const path = require('path')

module.exports = {
  command: ["poll"],
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

    	if (!Ryuu) return replytolak(mess.only.owner)
                let [poll, opt] = text.split("|")
                if (text.split("|") < 2)
    return await replyalya(
    `Sebutkan pertanyaan dan minimal 2 pilihan\nContoh: ${prefix}poll Siapa admin terbaik?|Ryuu,Alya...`
    )
                let options = []
                for (let i of opt.split(',')) {
    options.push(i)
                }
                await alya.sendMessage(m.chat, {
    poll: {
    name: poll,
    values: options
    }
                })
//                    case 'upvote': {
                if (!m.isGroup) return replytolak(mess.only.group)
                if (!(m.chat in vote)) return replyalya(`_*tidak ada voting di grup ini!*_\n\n*${prefix}vote* - untuk memulai voting`)
                isVote = vote[m.chat][1].concat(vote[m.chat][2])
                wasVote = isVote.includes(m.sender)
                if (wasVote) return replyalya('You have Voted')
                vote[m.chat][1].push(m.sender)
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
