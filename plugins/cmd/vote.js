// Plugin: vote
// Commands: vote
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['vote'],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

    // Vote storage (persistent across calls in same session)
    if (!global._voteDB) global._voteDB = {};
    const voteData = global._voteDB;

if (!m.isGroup) return replytolak(mess.only.group)
            if (m.chat in vote) return replyalya(`_Masih ada suara di chat ini!_\n\n*${prefix}deletevote* - untuk menghapus suara`)
            if (!text) return replyalya(`Masukkan Alasan Memilih, Contoh: *${prefix + command} Pemilik Tampan*`)
            replyalya(`Pemungutan suara dimulai!\n\n*${prefix}upvote* - untuk upvote\n*${prefix}downvote* - untuk downvote\n*${prefix}checkvote* - untuk memeriksa suara\n*${prefix} deletevote* - untuk menghapus suara`)
            voteData[m.chat] = [q, [], []]
            await sleep(1000)
            upvote = voteData[m.chat][1]
            devote = voteData[m.chat][2]
            teks_vote = `* VOTE *

*Reason:* ${voteData[m.chat][0]}

┌〔 UPVOTE 〕
│ 
├ Total: ${voteData[m.chat][1].length}
│
│ 
└────

┌〔 DOWNVOTE 〕
│ 
├ Total: ${voteData[m.chat][2].length}
│
│ 
└────

Please Type Below
*${prefix}upvote* - to cast vote
*${prefix}downvote* -  to downvote
*${prefix}deletevote* - to delete vote`
            alya.sendMessage(m.chat, {text: teks_vote}, {quoted:m})
  }
};
