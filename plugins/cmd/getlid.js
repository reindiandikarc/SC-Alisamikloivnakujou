// Plugin: getlid
// Auto-generated from Alya V12
// Commands: getlid

const path = require('path')

module.exports = {
  command: ["getlid"],
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

      if (!m.isGroup) return replytolak(mess.only.group)
      if (!Ryuu) return replytolak(mess.only.owner)

      let targetJid
      let notify = ''
      let groupMetadataLocal

      if (m.isGroup) {
        groupMetadataLocal = await alya.groupMetadata(m.chat)
      }

      if (m.quoted) {
        targetJid = m.quoted.sender
      } else if (m.mentionedJid?.length) {
        targetJid = m.mentionedJid[0]
      } else {
        targetJid = m.sender
        notify = 'Tidak ada reply pesan atau tag. Mengambil LID kamu sendiri:\n\n'
      }

      // Default lid (fallback)
      let lid = targetJid.replace(/@s\.whatsapp\.net$/, '') + '@lid'

      // Jika dalam grup, coba cari LID asli
      if (groupMetadataLocal) {
        let targetMeta = groupMetadataAlt.participants.find(p => p.id === targetJid || p.id?.includes(targetJid))
        if (targetMeta?.lid) {
          lid = targetMeta.lid
        }
      }

      replyalya(`*Hasil*\n${notify}*ID Target:* ${targetJid}\n*LID Target:* ${lid}`)
  }
}
