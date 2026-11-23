// Plugin: twitter
// Auto-generated from Alya V12
// Commands: twitterdl, twitter

const path = require('path')

module.exports = {
  command: ["twitterdl", "twitter"],
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

      function delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    if (!text) return reply('Linknya mana, bro..');
    try {
      alya.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key }});
    let { SD, HD, desc, thumb, audio } = await fg.twitter(text)
              let te = `
    ┌─⊷ *TWITTER DL*
    ▢ Description: ${desc}
    └───────────`
    alya.sendMessage(m.chat, {video: {url:HD}, caption: te}, {quoted: m})
    } catch (e) {
      console.error(e);
      reply('Server error!');
      return e.toString();
    }
  }
}
