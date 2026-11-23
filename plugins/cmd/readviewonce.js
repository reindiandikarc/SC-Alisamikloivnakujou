// Plugin: readviewonce
// Auto-generated from Alya V12
// Commands: rvo, readviewonce

const path = require('path')

module.exports = {
  command: ["rvo", "readviewonce"],
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

        if (!quoted) return replyalya('Reply pesan sekali lihat.');
        if (!mime) return replyalya(`Kirim foto/video/audio dengan caption *${prefix + command}*`);

        await alya.sendMessage(m.chat, {
            react: { text: "⏱️", key: m.key }
        });

        try {
            // Ambil caption asli
            let originalCaption = '';
            if (quoted.msg?.caption) {
                originalCaption = quoted.msg.caption;
            } else if (quoted.text) {
                originalCaption = quoted.text;
            }

            // Download sebagai buffer langsung (tidak perlu upload ke server eksternal)
            const mediaBuffer = await alya.downloadMediaMessage(quoted);
            if (!mediaBuffer || mediaBuffer.length === 0) throw new Error('Gagal mendownload media.');

            if (/image/.test(mime)) {
                await alya.sendMessage(m.chat, {
                    image: mediaBuffer,
                    caption: originalCaption ? '`Pesan :`\n> ' + originalCaption : ''
                }, { quoted: m });
            }
            else if (/video/.test(mime)) {
                await alya.sendMessage(m.chat, {
                    video: mediaBuffer,
                    caption: originalCaption ? '`Pesan :`\n> ' + originalCaption : ''
                }, { quoted: m });
            }
            else if (/audio/.test(mime)) {
                const isVoice = /ogg/.test(mime);
                await alya.sendMessage(m.chat, {
                    audio: mediaBuffer,
                    mimetype: mime,
                    ptt: isVoice
                }, { quoted: m });
            }
            else {
                replyalya('Jenis media tidak support.');
            }

            await alya.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        } catch (err) {
            console.error('RVO ERROR:', err);
            await alya.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            replyalya(`❌ Gagal membuka pesan: ${err.message}`);
        }
  }
}
