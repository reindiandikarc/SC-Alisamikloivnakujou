// Plugin: simi
// Auto-generated from Alya V12
// Commands: simi

const path = require('path')

module.exports = {
  command: ["simi"],
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

      if(!text) return replyalya("mau tanya apa kak")
      alya.sendMessage(m.chat, { react: { text: '🕒', key: m.key }})
      const data = await fetchJson(`https://api.hiuraa.my.id/ai/simi?text=${encodeURIComponent(text)}&lang=id}`)
      reply(data.result)
  }
}
