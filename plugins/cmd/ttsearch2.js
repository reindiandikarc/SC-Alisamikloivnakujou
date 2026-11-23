// Plugin: ttsearch2
// Auto-generated from Alya V12
// Commands: ttsearch2
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')

const path = require('path')

module.exports = {
  command: ["ttsearch2"],
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

      if (!text) return replytolak(`⚠️ Eits, kakak lupa kasih kata kunci! 😗\nCoba ketik kayak gini ya: *${prefix + command} jj epep* biar alya bisa bantu cari yang kakak mau! 🔍💬`);

    		await alya.sendMessage(m.chat, {
            react: {
              text: '🔎',
              key: m.key
            }
          });
      try {
        const { data } = await axios.get(`https://api.siputzx.my.id/api/s/tiktok?query=${encodeURIComponent(text)}`);
        if (!data.status || !data.data || data.data.length === 0) return replyalya('Video tidak ditemukan di TikTok 😢');

        const videos = data.data.slice(0, 10); // ambil max 6 hasil

        const cards = await Promise.all(videos.map(async (v, i) => {
          const media = await prepareWAMessageMedia({ video: { url: v.play } }, { upload: alya.waUploadToServer });

          const info = `🎥 *${v.title || 'Tanpa Judul'}*
    🕒 Durasi: ${v.duration || 0} detik
    👤 ${v.author?.nickname || '-'}
    👍 ${v.digg_count || 0} | 💬 ${v.comment_count || 0} | 🔁 ${v.share_count || 0}
    🔗 https://www.tiktok.com/@${v.author?.unique_id}/video/${v.video_id}`;

          return {
            header: {
              hasMediaAttachment: true,
              videoMessage: media.videoMessage,
              title: `🎬 Video ${i + 1} dari ${videos.length}`,
              subtitle: `${v.author?.nickname || 'Unknown'}`
            },
            body: { text: info },
            nativeFlowMessage: {
              buttons: [
                {
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({
                    display_text: '🌐 Lihat di TikTok',
                    url: `https://www.tiktok.com/@${v.author?.unique_id}/video/${v.video_id}`,
                    merchant_url: `https://www.tiktok.com/@${v.author?.unique_id}/video/${v.video_id}`
                  })
                }
              ]
            }
          };
        }));

        const msg = generateWAMessageFromContent(
          m.chat,
          {
            viewOnceMessage: {
              message: {
                interactiveMessage: {
                  body: { text: `🔍 *Hasil pencarian TikTok untuk:* _${text}_` },
                  footer: { text: 'Geser kanan untuk melihat video lainnya ➡️' },
                  carouselMessage: {
                    cards,
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
        console.error('❌ Error ttsearch carousel:', err);
        replyalya('Terjadi kesalahan saat mengambil data dari TikTok 😭');
      }
  }
}
