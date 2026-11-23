// Plugin: resetspam
// Auto-generated from Alya V12
// Commands: resetspam

const path = require('path')

module.exports = {
  command: ["resetspam"],
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

        spamData = {}
        spamWarnings = {}

        fs.writeFileSync(dbSpamCounter, JSON.stringify({}, null, 2))
        fs.writeFileSync(dbSpamWarn, JSON.stringify({}, null, 2))

        replyalya('🧹 *Database Anti-Spam Berhasil Dibersihkan!* \nSemua user kembali suci.')
  }
}
