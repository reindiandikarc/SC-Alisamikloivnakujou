// Plugin: changeleft
// Auto-generated from Alya V12
// Commands: changeleft

const path = require('path')

module.exports = {
  command: ["changeleft"],
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
    if (!text) return reply(`Gunakan: ${prefix + command} *teks_left*\n\nContoh: ${prefix + command} Bye @user, sampai jumpa dari @group`)
    if (isSetLeft(m.chat, set_left_db)) {
    addCountCmd('#changeleft', m.sender, _cmd)
    changeSetLeft(text, m.chat, set_left_db)
    reply(`✅ Sukses update teks left!`)
    } else {
    addCountCmd('#changeleft', m.sender, _cmd)
    addSetLeft(text, m.chat, set_left_db)
    reply(`✅ Sukses set teks left!`)
    }
  }
}
