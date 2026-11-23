// Plugin: reportbug
// Auto-generated from Alya V12
// Commands: reportbug

const path = require('path')

module.exports = {
  command: ["reportbug"],
  tags: ['bug'],
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
    	if (!text) return replyalya(`Example : ${
            prefix + command
          } hi dev play command is not working`)
                textt = `*| REQUEST/BUG |*`
                teks1 = `\n\n*User* : @${
       m.sender.split("@")[0]
      }\n*Request/Bug* : ${text}`
                teks2 = `\n\n*Hai ${pushname}, Permintaan Anda telah diteruskan ke Pemilik saya*.\n*Harap tunggu...*`
                for (let i of owner) {
    alya.sendMessage(i + "@s.whatsapp.net", {
    text: textt + teks1,
    mentions: [m.sender],
    }, {
    quoted: m,
    })
                }
                alya.sendMessage(m.chat, {
    text: textt + teks2 + teks1,
    mentions: [m.sender],
                }, {
    quoted: m,
                })

  }
}
