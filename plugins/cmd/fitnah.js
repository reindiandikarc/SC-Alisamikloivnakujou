// Plugin: fitnah
// Auto-generated from Alya V12
// Commands: fitnah

const path = require('path')

module.exports = {
  command: ["fitnah"],
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

        if (!text) return alya.sendMessage(m.chat, { text: `Example : ${prefix + command} pesan target|pesan mu|nomor/tag target` })

        let [teks1, teks2, teks3] = text.split('|')
        if (!teks1 || !teks2 || !teks3) return alya.sendMessage(m.chat, { text: `Example : ${prefix + command} pesan target|pesan mu|nomor/tag target` })

        let target = teks3.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

        let fakeQuoted = {
            key: {
                fromMe: false,
                participant: target,
                ...(m.isGroup ? { remoteJid: m.chat } : { remoteJid: target })
            },
            message: {
                conversation: teks1
            }
        }
        await alya.sendMessage(m.chat, { text: teks2 }, { quoted: fakeQuoted })
  }
}
