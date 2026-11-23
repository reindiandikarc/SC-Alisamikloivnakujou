// Plugin: upvote
// Commands: upvote
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['upvote'],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

    // Vote storage (persistent across calls in same session)
    if (!global._voteDB) global._voteDB = {};
    const voteData = global._voteDB;

if (!m.isGroup) return replytolak(mess.only.group)
            if (!(m.chat in vote)) return replyalya(`_*tidak ada voting di grup ini!*_\n\n*${prefix}vote* - untuk memulai voting`)
            isVote = voteData[m.chat][1].concat(voteData[m.chat][2])
            wasVote = isVote.includes(m.sender)
            if (wasVote) return replyalya('You have Voted')
            voteData[m.chat][1].push(m.sender)
            menvote = voteData[m.chat][1].concat(voteData[m.chat][2])
            teks_vote = `* VOTE *

*Reason:* ${voteData[m.chat][0]}

┌〔 UPVOTE 〕
│ 
├ Total: ${voteData[m.chat][1].length}
${voteData[m.chat][1].map((v, i) => `├ ${i + 1}. @${v.split`@`[0]}`).join('\n')}
│ 
└────

┌〔 DOWNVOTE 〕
│ 
├ Total: ${voteData[m.chat][2].length}
${voteData[m.chat][2].map((v, i) => `├ ${i + 1}. @${v.split`@`[0]}`).join('\n')}
│ 
└────

Please Type Below
*${prefix}upvote* - to upvote
*${prefix}downvote* -  to downvote
*${prefix}deletevote* - to delete vote`
            alya.sendMessage(m.chat, {text: teks_vote, mentions: menvote}, {quoted:m})
  }
};
