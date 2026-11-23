// Plugin: script
// Commands: script

const path = require('path')

module.exports = {
  command: ["script"],
  tags: ['owner'],
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

    replyalya(`📜 *INFO SCRIPT*\n\n🤖 *${botname || 'Alya Bot'}*\n📦 *Versi: V13*\n\n✅ Script ini dibuat dengan penuh dedikasi\n💡 Gunakan dengan bijak dan bertanggung jawab\n\n*Fitur Unggulan:*\n• 🤖 AI Interactive\n• 🎮 Game RPG & Ultraman\n• 🎨 Edit Foto & Anime\n• 🎵 Downloader\n• 🛡️ Anti-spam & Moderation\n• 📊 Premium System\n• 💬 Anonymous Chat\n• Dan masih banyak lagi!`)
  }
}
