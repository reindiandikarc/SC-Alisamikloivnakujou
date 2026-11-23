// Plugin: travel-assistant
// Auto-generated from Alya V12
// Commands: travel-assistant

const path = require('path')

module.exports = {
  command: ["travel-assistant"],
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

    	if (!text) return reply(`*• Contoh:* ${prefix + command} bagaimana cara mengunjungi taj mahal`);
    await alya.sendMessage(m.chat, { react: { text: "⏱️",key: m.key,}})
    try {
    const data = await fetchJson(`https://btch.us.kg/openai?text=${encodeURIComponent(text)}`);
        if (data && data.result) {
            reply(`${data.result}`);
        } else {
            AlyaAI(pushname, text);
        }
     } catch(e) {
     reply('eror')
    }
  }
}
