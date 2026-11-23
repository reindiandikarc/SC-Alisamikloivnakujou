// Plugin: unblock
// Commands: unblock

const path = require('path')

module.exports = {
  command: ["unblock"],
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

    if (!Ryuu) return replytolak(mess.only.owner)
    let users = m.mentionedJid[0] 
      ? m.mentionedJid[0] 
      : quoted 
        ? quoted.sender 
        : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

    if (!users) return replyalya(`Sebutkan siapa yang mau di-unblock!\nContoh: ${prefix + command} @tag atau reply pesan`)

    try {
      await alya.updateBlockStatus(users, 'unblock')
      replyalya(`✅ *Berhasil meng-unblock ${users.split('@')[0]}*`)
    } catch (e) {
      replyalya(`❌ Gagal unblock: ${e.message}`)
    }
  }
}
