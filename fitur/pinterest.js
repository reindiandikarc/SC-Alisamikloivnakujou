// Plugin: pinterest
// Auto-generated from Alya V12
// Commands: pin, pinterest, pinterestdl, pindl

const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')
const path = require('path')

module.exports = [
  {
    command: ["pin", "pinterest"],
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

      if (!text) return m.reply(`Contoh: ${prefix}pin Alyachan`)

      await alya.sendMessage(m.chat, {
          react: { text: '🔎', key: m.key }
      })

      try {
          const { data } = await axios.get(
              `https://api.nexray.web.id/search/pinterest?q=${encodeURIComponent(text)}`
          )

          if (!data?.status || !Array.isArray(data.result) || !data.result.length) {
              throw new Error('Primary API empty')
          }

          const results = data.result.slice(0, 15)

          const cards = await Promise.all(results.map(async (item, i) => {
              const media = await prepareWAMessageMedia(
                  { image: { url: item.images_url } },
                  { upload: alya.waUploadToServer }
              )

              return {
                  header: proto.Message.InteractiveMessage.Header.create({
                      ...media,
                      title: `Gambar ${i + 1}`,
                      subtitle: item.grid_title || 'Tidak ada judul',
                      hasMediaAttachment: true
                  }),
                  body: {
                      text:
  `📌 Caption: ${item.description || 'Tidak ada'}
    👤 Author: ${item.pinner?.full_name || item.pinner?.username || 'Unknown'}
    👥 Followers: ${item.pinner?.follower_count || 0}
    🗂️ Board: ${item.board?.name || '-'}
    🔗 URL: ${item.pin}`
                  },
                  nativeFlowMessage: { buttons: [] }
              }
          }))

          const msg = generateWAMessageFromContent(
              m.chat,
              {
                  viewOnceMessage: {
                      message: {
                          interactiveMessage: {
                              body: { text: `Hasil Pinterest untuk *${text}*` },
                              carouselMessage: {
                                  cards,
                                  messageVersion: 1
                              }
                          }
                      }
                  }
              },
              { quoted: m }
          )

          return alya.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

      } catch (err) {
          console.warn('Primary Pinterest API failed, fallback used')

          try {
              const api = `https://anabot.my.id/api/search/pinterest?query=${encodeURIComponent(text)}&apikey=freeApikey`
              const { data } = await axios.get(api)

              if (!data?.success || !data?.data?.result?.length) {
                  return m.reply('Hasil pencarian kosong.')
              }

              const pins = data.data.result.slice(0, 15)
              let cards = []

              for (let i = 0; i < pins.length; i++) {
                  const pin = pins[i]

                  const imageUrl =
                      pin.images?.["736x"]?.url ||
                      pin.images?.["345x"]?.url ||
                      pin.images?.["200x"]?.url

                  if (!imageUrl) continue

                  const media = await prepareWAMessageMedia(
                      { image: { url: imageUrl } },
                      { upload: alya.waUploadToServer }
                  )

                  cards.push({
                      header: proto.Message.InteractiveMessage.Header.create({
                          ...media,
                          title: `Gambar ${i + 1}`,
                          subtitle: pin.title || 'Tidak ada judul',
                          hasMediaAttachment: true
                      }),
                      body: {
                          text:
  `📌 ID: ${pin.id}
    👤 Uploader: ${pin.pinner?.username || 'Unknown'}
    📄 Deskripsi: ${pin.description || 'Tidak tersedia'}`
                      },
                      nativeFlowMessage: { buttons: [] }
                  })
              }

              const msg = generateWAMessageFromContent(
                  m.chat,
                  {
                      viewOnceMessage: {
                          message: {
                              interactiveMessage: {
                                  body: { text: `Hasil Pinterest untuk *${text}*` },
                                  carouselMessage: {
                                      cards,
                                      messageVersion: 1
                                  }
                              }
                          }
                      }
                  },
                  { quoted: m }
              )

              await alya.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

          } catch (e) {
              console.error(e)
              m.reply('gagal 😭')
          }
      }
    }
  },

  {
    command: ["pinterestdl", "pindl"],
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

      const axios = require('axios');
      const cheerio = require('cheerio');
      let biaya = 3;

      if (!db.users[m.sender]) db.users[m.sender] = { limit: 0 };
      if (db.users[m.sender].limit < biaya) {
          return replyalya(`❌ Limit kamu tidak cukup!\n\n💡 Butuh: ${biaya}\n😒 Punya kamu: ${db.users[m.sender].limit}`);
      }

      if (!text) return replyalya(`Hadeh... linknya mana coba? 😒\nContoh: ${prefix + command} https://pin.it/xxxxx`);

      await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

      try {
          const homePage = await axios.get('https://snappin.app/id/pinterest-video-downloader-1', {
              headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0'
              }
          });

          const cookie = homePage.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
          const $home = cheerio.load(homePage.data);
          const csrfToken = $home('meta[name="csrf-token"]').attr('content') || "";

          const commonHeaders = {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0',
              'Accept': '*/*',
              'Accept-Language': 'id,en-US;q=0.9,en;q=0.8',
              'Origin': 'https://snappin.app',
              'Referer': 'https://snappin.app/id/pinterest-video-downloader-1',
              'Cookie': cookie,
              'X-CSRF-TOKEN': csrfToken,
              'Content-Type': 'application/json'
          };

          const resolveRes = await axios.post('https://snappin.app/api/resolve',
              { url: text },
              { headers: commonHeaders }
          );

          const resolvedUrl = resolveRes.data.url;
          if (!resolvedUrl) throw 'Gagal me-resolve URL Pinterest.';

          const downloadPage = await axios.post('https://snappin.app/',
              { url: resolvedUrl },
              { headers: commonHeaders }
          );

          const $ = cheerio.load(downloadPage.data);
          const videoHref = $('a[href*="download-file"]').attr('href');
          const imageHref = $('a[href*="download-image"]').attr('href');
          const thumb = $('img[style*="object-fit: cover"]').attr('src');

          if (!videoHref && !imageHref) throw 'Media tidak ditemukan. Pastikan link benar.';

          let isVideo = !!videoHref;
          let finalDownloadPath = isVideo ? videoHref : imageHref;
          let finalDownloadUrl = finalDownloadPath.startsWith('http') ? finalDownloadPath : `https://snappin.app${finalDownloadPath}`;

          const caption = `📥 *Pinterest Downloader*
    👤 Request: @${pushname.split('\n')[0]}
    📊 Type: ${isVideo ? 'VIDEO' : 'IMAGE'}

    💸 Limit kepotong: ${biaya}
    Jangan manja... ini ga gratis 😏`;

          if (isVideo) {
              await alya.sendMessage(m.chat, {
                  video: { url: finalDownloadUrl },
                  caption: caption,
                  mentions: [m.sender]
              }, { quoted: m });
          } else {
              await alya.sendMessage(m.chat, {
                  image: { url: finalDownloadUrl },
                  caption: caption,
                  mentions: [m.sender]
              }, { quoted: m });
          }
          db.users[m.sender].limit -= biaya;
          await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      } catch (err) {
          console.error('Pinterest Error:', err.response?.data || err.message);
          await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

          let msg = err.response?.data?.message || err;
          if (msg.includes('CSRF')) msg = "Session expired, coba lagi beberapa saat lagi.";
          replyalya(`❌ Gagal: ${msg}`);
      }
    }
  }
]
