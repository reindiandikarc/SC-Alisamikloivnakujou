// Plugin: pak-ustad2
// Auto-generated from Alya V12
// Commands: paustad, pak-ustad2

const path = require('path')

module.exports = {
  command: ["paustad", "pak-ustad2"],
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

        if (!text) return m.reply(`Contoh:\n${prefix + command} Makan Sambil Kuyang Bisa Gak Pak Ustad`);
        await alya.sendMessage(m.chat, {
            image: { url: `https://api.taka.my.id/pak-ustadv2?text=${encodeURIComponent(text)}` },
            caption: `Pak Ustad berkata: ${text}`
        }, { quoted: m });
  }
}
