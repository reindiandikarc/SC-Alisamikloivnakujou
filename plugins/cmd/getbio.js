// Plugin: getbio
// Auto-generated from Alya V12
// Commands: getbio

const path = require('path')

module.exports = {
  command: ["getbio"],
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

                  try {
        let who
        if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender
        else who = m.quoted.sender ? m.quoted.sender : m.sender
        let bio = await alya.fetchStatus(who)
        replyalya(bio.status)
      } catch {
        if (text) return replyalya(`bio is private or you haven't replied to the person's message!`)
        else try {
          let who = m.quoted ? m.quoted.sender : m.sender
          let bio = await alya.fetchStatus(who)
          replyalya(bio.status)
        } catch {
          return replyalya(`biodatanya pribadi atau Anda belum membalas pesan orang tersebut!`)
        }
      }
  }
}
