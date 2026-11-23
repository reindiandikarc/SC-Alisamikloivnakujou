// Plugin: leavegc
// Commands: leavegc

const path = require('path')

module.exports = {
  command: ["leavegc"],
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
    
    let targetGc = text ? text.trim() : from

    if (!targetGc.includes('@g.us')) {
      if (!isGroup) return replyalya(`❌ Gunakan perintah ini di grup atau berikan ID grup!\nContoh: ${prefix + command} 1234567890-123456@g.us`)
      targetGc = from
    }

    try {
      await replyalya(`👋 *Bot akan keluar dari grup ini...*`)
      await new Promise(r => setTimeout(r, 1500))
      await alya.groupLeave(targetGc)
    } catch (e) {
      replyalya(`❌ Gagal keluar dari grup: ${e.message}`)
    }
  }
}
