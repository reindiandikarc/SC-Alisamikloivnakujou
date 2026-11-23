// Plugin: yt
// Auto-generated from Alya V12
// Commands: yt

const path = require('path')

module.exports = {
  command: ["yt"],
  tags: ['downloader'],
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

        if (!text) return replyalya("⚠️ Kirim link YouTube.\n\nContoh:\n*yt https://youtu.be/xxxxxxx*")
        if (!isUrl(text) || !text.includes("youtu")) return replytolak ("❌ Link tidak valid!")

        let caption = `🔗 Link:\n${text}\n\nPilih tipe unduhan:`

        const buttons = [
            { buttonId: `${prefix}ytmp3 ${text}`, buttonText: { displayText: "🎵 Audio" }, type: 1 },
            { buttonId: `${prefix}ytmp4 ${text}`, buttonText: { displayText: "🎥 Video" }, type: 1 }
        ]

        let buttonMessage = {
            text: caption,
            footer: "",
            buttons: buttons,
            headerType: 2
        }

        await alya.sendMessage(m.chat, buttonMessage, { quoted: m })
  }
}
