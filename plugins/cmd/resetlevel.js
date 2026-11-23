// Plugin: resetlevel
// Auto-generated from Alya V12
// Commands: resetlevel

const path = require('path')

module.exports = {
  command: ["resetlevel"],
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

    if (!Ryuu) return reply("❌ Perintah ini hanya untuk Owner!")

    let users = Object.keys(global.db.users)

    let total = 0

    for (let id of users) {

      let user = global.db.users[id]

      user.level = 0
      user.exp = 0
      user.role = "Pemula"

      total++

    }

    reply(`✅ Berhasil mereset level & exp ${total} user`)

  }
}
