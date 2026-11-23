// Plugin: ytsearch
// V20 FIX:
//   ✅ prepareWAMessageMedia + proto di-require sendiri (tidak dari ctx — tidak ada di sana)
//   ✅ generateWAMessageFromContent juga di-require sendiri
//   ✅ Carousel 7 hasil YouTube dengan thumbnail + tombol download
//   ✅ Error handling per-slide (thumbnail gagal upload tidak crash semua)
//   ✅ Command: yts, ytsearch

'use strict'

const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = require('@whiskeysockets/baileys')
const yts = require('yt-search')

module.exports = {
  command: ['yts', 'ytsearch'],
  tags: ['downloader'],
  run: async (alya, m, ctx) => {
    const { command, text, prefix, replyalya } = ctx

    if (!text) {
      return replyalya(
        `Duh, mau cari apa sih? 🙄\n` +
        `Masukin kata kuncinya yang jelas dong!\n\n` +
        `Contoh: *${prefix + command}* Silhouette KANA-BOON`
      )
    }

    await alya.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

    try {
      const ytsSearch = await yts(text)
      // Filter hanya video (bukan channel/playlist)
      const results = (ytsSearch.all || [])
        .filter(v => v.type === 'video' || v.url?.includes('/watch'))
        .slice(0, 7)

      if (!results.length) {
        return replyalya('Hah? Nggak ketemu! 💢\nCoba cari yang bener, jangan bikin aku kerja dua kali!')
      }

      const slides = []

      for (const video of results) {
        const { title, url, ago, views, author, image, duration } = video

        // Format durasi
        const durStr = (duration && typeof duration === 'object' && duration.timestamp)
          ? duration.timestamp
          : (duration?.toString() || '??:??')

        let mediaObj = {}
        try {
          if (image) {
            mediaObj = await prepareWAMessageMedia(
              { image: { url: image } },
              { upload: alya.waUploadToServer }
            )
          }
        } catch (e) {
          console.warn('[yts] thumbnail gagal:', e.message)
        }

        slides.push({
          header: proto.Message.InteractiveMessage.Header.create({
            ...mediaObj,
            title: `🎬 ${title}`,
            hasMediaAttachment: !!mediaObj.imageMessage
          }),
          nativeFlowMessage: {
            buttons: [
              {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                  display_text: '🎵 Download Audio',
                  id: `${prefix}ytmp3 ${url}`
                })
              },
              {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                  display_text: '🎥 Download Video',
                  id: `${prefix}ytmp4 ${url}`
                })
              },
              {
                name: 'cta_copy',
                buttonParamsJson: JSON.stringify({
                  display_text: '🔗 Salin Link',
                  copy_code: url
                })
              }
            ]
          },
          footer: {
            text: `⏱️ ${durStr} | 📅 ${ago} | 👀 ${views} | 🎤 ${author?.name || 'Anonim'}`
          }
        })
      }

      const msg = await generateWAMessageFromContent(
        m.chat,
        {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2
              },
              interactiveMessage: {
                body: {
                  text:
                    `🔎 Hasil pencarian YouTube\n` +
                    `🔍 Kata kunci: *"${text}"*\n\n` +
                    `Geser untuk lihat semua hasil dan pilih yang kamu mau! 👆`
                },
                footer: {
                  text: 'Bukan berarti aku mau bantuin kamu ya! 😤'
                },
                carouselMessage: {
                  cards: slides,
                  messageVersion: 1
                }
              }
            }
          }
        },
        { quoted: m }
      )

      await alya.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (err) {
      console.error('[yts]', err.message)
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      replyalya(`❌ Gagal mencari video.\n\n_${err.message || 'Error tidak diketahui'}_`)
    }
  }
}
