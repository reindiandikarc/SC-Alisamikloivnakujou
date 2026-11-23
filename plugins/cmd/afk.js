// Plugin: afk
// Auto-generated from Alya V12
// Commands: afk

const path = require('path')

module.exports = {
  command: ["afk"],
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

        if (m.key.fromMe) return
        if (!m.isGroup) return replytolak(mess.only.group)
        if (!text) return replyalya(`📌 Example: *${prefix+command}* want to sleep`)

        let userAlt = global.db.users[m.sender]
        userAlt.afkTime = + new Date
        userAlt.afkReason = args.join(" ")

        replyalya(
    `✅ *Kamu telah AFK!*

    👤 ${m.pushName} sekarang AFK.
    💤 Alasan : ${args.length ? args.join(" ") : '-'}

    ─────────────────────
    💡 Jangan khawatir, status AFK akan hilang otomatis kalau kamu kirim pesan lagi.
    `.trim())
  }
}
