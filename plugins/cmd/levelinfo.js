// Plugin: levelinfo
// Auto-generated from Alya V12
// Commands: levelinfo

const path = require('path')

module.exports = {
  command: ["levelinfo"],
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

      let target = m.mentionedJid[0] || m.quoted?.sender || m.sender

      if (!(target in global.db.users))
        return replyalya('User tidak ditemukan.')

      let userAlt = global.db.users[target]

      let level = userAlt.level || 0
      let exp = userAlt.exp || 0
      let role = userAlt.role || "Pemula"

      let requiredXP = 100000 * (level + 1)

      let percent = Math.floor((exp / requiredXP) * 100000)
      let barTotal = 20
      let filled = Math.floor((percent / 100) * barTotal)
      let bar = "█".repeat(filled) + "░".repeat(barTotal - filled)

      replyalya(`📊 *LEVEL INFO*

    👤 User : @${target.split('@')[0]}
    🏅 Role : ${role}

    🎯 Level : ${level}
    ⭐ XP : ${exp} / ${requiredXP}

    📈 Progress
    ${bar} ${percent}%`, { mentions: [target] })
  }
}
