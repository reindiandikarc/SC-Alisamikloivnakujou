// Plugin: changewelcome
// Auto-generated from Alya V12
// Commands: changewelcome

const path = require('path')

module.exports = {
  command: ["changewelcome"],
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

    if (!m.isGroup) return replytolak('Fitur Khusus Group!')
    if (!Ryuu && !isAdmins) return reply('Fitur Khusus owner!')
    if (!text) return reply(`Gunakan: ${prefix+command} *teks_welcome*\n\nContoh: ${prefix+command} Hai @user, selamat datang di @group`)
    if (isSetWelcome(m.chat, set_welcome_db)) {
    addCountCmd('#changewelcome', m.sender, _cmd)
    changeSetWelcome(text, m.chat, set_welcome_db)
    reply(`✅ Sukses update teks welcome!`)
    } else {
    addCountCmd('#changewelcome', m.sender, _cmd)
    addSetWelcome(text, m.chat, set_welcome_db)
    reply(`✅ Sukses set teks welcome!`)
    }
  }
}
