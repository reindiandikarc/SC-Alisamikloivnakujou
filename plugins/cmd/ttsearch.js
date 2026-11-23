// Plugin: ttsearch
// Auto-generated from Alya V12
// Commands: ttsearch
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')

const path = require('path')

module.exports = {
  command: ["ttsearch"],
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

    const db = global.db
      if (!text) return replytolak(`Contoh: ${prefix}ttsearch Alya`);

      let biaya = 10
      if (db.users[m.sender].limit < biaya) {
        return replyalya(`❌ Limit kamu tidak cukup!

    💡 Limit dibutuhkan: ${biaya}
    🎟 Limit kamu: ${db.users[m.sender].limit}`)
      }

      db.users[m.sender].limit -= biaya

      await alya.sendMessage(m.chat, {
        react: {
          text: '🔎',
          key: m.key
        }
      });

      try {
        const { data } = await axios.get(`https://api.ootaizumi.web.id/search/tiktok?query=${encodeURIComponent(text)}`);

        if (!data.status || !data.result || data.result.length === 0) return replyalya('Video tidak ditemukan.');

        const videos = data.result.slice(0, 5);

        let cards = await Promise.all(videos.map(async (item, i) => {
          const videoData = await prepareWAMessageMedia(
            { video: { url: item.play } },
            { upload: alya.waUploadToServer }
          );

          const videoInfo = `
    🎬 *${item.title}*
    🕒 *Durasi:* ${item.duration}s
    👍 *Likes:* ${item.digg_count} | 💬 *Komentar:* ${item.comment_count}
    📲 *Link Video:* ${item.play}`;

          return {
            header: proto.Message.InteractiveMessage.Header.create({
              ...videoData,
              title: item.title,
              subtitle: `Video ${i + 1} dari ${videos.length}`,
              hasMediaAttachment: true
            }),
            body: { text: videoInfo },
            nativeFlowMessage: { buttons: [] }
          };
        }));

        let msg = generateWAMessageFromContent(
          m.chat,
          {
            viewOnceMessage: {
              message: {
                interactiveMessage: {
                  body: { text: `Hasil pencarian video TikTok untuk *${text}*` },
                  carouselMessage: {
                    cards: cards,
                    messageVersion: 1
                  }
                }
              }
            }
          },
          { quoted: m }
        );

        await alya.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

      } catch (err) {
        console.error(err);
        replyalya('Terjadi kesalahan saat mengambil video.');
      }
  }
}
