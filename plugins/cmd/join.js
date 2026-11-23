// Plugin: join
// Commands: join

const path = require('path')

module.exports = {
  command: ["join"],
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
    if (!text) return replyalya(`Masukkan link grup!\nContoh: ${prefix + command} https://chat.whatsapp.com/XXXX`)
    
    let link = text.trim()
    if (!link.includes('chat.whatsapp.com/')) return replyalya('❌ Link grup WhatsApp tidak valid!')
    
    try {
      let inviteCode = link.split('chat.whatsapp.com/')[1].split('?')[0].trim()
      let groupInfo = await alya.groupGetInviteInfo(inviteCode)
      await alya.groupAcceptInvite(inviteCode)
      replyalya(`✅ *Berhasil join grup*\n\n🏷️ Nama: *${groupInfo.subject}*\n🆔 ID: *${groupInfo.id}*`)
    } catch (e) {
      console.log(e)
      replyalya(`❌ Gagal join grup. Pastikan link valid dan belum expired.\n\nError: ${e.message}`)
    }
  }
}
