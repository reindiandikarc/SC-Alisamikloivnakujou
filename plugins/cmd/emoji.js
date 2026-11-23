// Plugin: emoji
// Auto-generated from Alya V12
// Commands: emoji

const path = require('path')

module.exports = {
  command: ["emoji"],
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

      if (!text || [...text].length !== 1 || !/\p{Emoji}/u.test(text)) {
        return replyalya("Kirim 1 emoji saja, contoh: emoji 😍");
      }

      // Ambil kode Unicode dari emoji
      const codePoints = [...text].map(char => char.codePointAt(0).toString(16)).join('-');
      const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${codePoints}.png`;

      try {
        let stiker = new Sticker(url, {
          pack: 'Alya chan',
          author: 'Reindiandikarc',
          type: StickerTypes.FULL,
          quality: 80
        });

        const buffer = await stiker.build();
        await alya.sendMessage(m.chat, { sticker: buffer }, { quoted: m });

      } catch (e) {
        console.error(e);
        replyalya("Gagal mengubah emoji jadi stiker.");
      }
  }
}
