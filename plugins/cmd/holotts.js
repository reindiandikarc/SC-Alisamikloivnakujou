// Plugin: holotts
// Auto-generated from Alya V12
// Commands: holotts

const path = require('path')

module.exports = {
  command: ["holotts"],
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

      if (!text) return replyalya(`❗ Contoh penggunaan:\n${prefix + command} <karakter>|<teks>\n\nContoh:\n${prefix + command} roboco|hello`);

      const [charKey, ...textParts] = text.split('|');
      const teks = textParts.join('|').trim();

      if (!charKey || !teks) return replyalya(`❗ Format salah!\nGunakan:\n${prefix + command} <karakter>|<teks>`);

      const karakter = charKey.trim().toLowerCase();
      if (!Object.keys(hololiveModels).includes(karakter)) {
        return replyalya(`❗ Karakter tidak ditemukan!\n\nKarakter yang tersedia:\n${Object.keys(hololiveModels).join(', ')}`);
      }

      await alya.sendMessage(m.chat, { react: { text: "🎤", key: m.key } });

      try {
        const audioUrl = await ttsHololive(teks, karakter);

        await alya.sendMessage(m.chat, {
          audio: { url: audioUrl },
          mimetype: 'audio/mpeg',
          ptt: true
        }, { quoted: m });

      } catch (err) {
        replyalya(`❌ Gagal membuat TTS: ${err.message}`);
      }
    }
    //==================================================================
  }
