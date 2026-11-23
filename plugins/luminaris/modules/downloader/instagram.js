import { createRequire } from 'node:module'
import { CHAT } from '../../_runtime/core-shim.js'
import { logger } from '../../_runtime/core-shim.js'

// Use createRequire to import CommonJS module in ESM
const require = createRequire(import.meta.url)
const Instagram = require('cakkatrok-instagram-downloader')

const IG_URL_RE = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(p|reel|stories|reels)\/\S+/i
const delay = (ms) => new Promise((r) => setTimeout(r, ms))

function captionHeader(type, input) {
  const label = type === 'story' ? 'Instagram Story' : 'Instagram Post'
  const sub = type === 'story' ? `@${input.replace(/^@/, '')}` : input
  return `${label}\n${sub}`
}

export default {
  name: 'instagram',
  command: ['instagram', 'ig', 'igdl', 'igstory', 'igreel'],
  event: [],
  allow: CHAT.BOTH,
  roleRequired: 10,
  category: 'downloader',
  description: 'Download story/reel/post Instagram',

  async handle(ctx) {
    const { sock, msg, args, chat } = ctx
    const input = (args[0] || '').trim()

    if (!input) {
      return sock.sendMessage(chat, {
        text: '❌ Kirim link atau username Instagram!\n\n' +
              '*Contoh:*\n' +
              '• !ig https://www.instagram.com/reel/ABC123/\n' +
              '• !ig https://www.instagram.com/p/ABC123/\n' +
              '• !igstory instagram (download story)'
      }, { quoted: msg })
    }

    const isUrl = IG_URL_RE.test(input)
    const isStory = !isUrl || /\/stories\//i.test(input)

    await sock.sendMessage(chat, { react: { text: '⏳', key: msg.key } })

    try {
      let result
      if (isStory) {
        result = await Instagram.story(input)
      } else {
        result = await Instagram.media(input)
      }

      if (!result || result.status !== 'ok' || !result.media?.length) {
        await sock.sendMessage(chat, { 
          text: '❌ Gagal mengunduh. Link-nya valid kak? Atau akunnya private?' 
        }, { quoted: msg })
        await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
        return
      }

      const header = captionHeader(result.type || (isStory ? 'story' : 'post'), input)

      for (let i = 0; i < result.media.length; i++) {
        const item = result.media[i]
        const itemCaption = i === 0 ? header : undefined

        try {
          if (item.type === 'video') {
            await sock.sendMessage(chat, {
              video: { url: item.url },
              mimetype: 'video/mp4',
              caption: itemCaption
            }, { quoted: msg })
          } else if (item.type === 'photo') {
            await sock.sendMessage(chat, {
              image: { url: item.url },
              mimetype: 'image/jpeg',
              caption: itemCaption
            }, { quoted: msg })
          } else {
            await sock.sendMessage(chat, {
              document: { url: item.url },
              mimetype: 'application/octet-stream',
              fileName: item.filename || 'instagram_media',
              caption: itemCaption
            }, { quoted: msg })
          }
        } catch (sendErr) {
          logger.error(`Failed to send IG media item ${i}`, sendErr)
        }

        if (i < result.media.length - 1) {
          await delay(1500)
        }
      }

      await sock.sendMessage(chat, { react: { text: '✅', key: msg.key } })

    } catch (err) {
      logger.error('Instagram download failed', err)
      await sock.sendMessage(chat, { 
        text: '❌ Gagal mengunduh dari Instagram. Coba lagi nanti.' 
      }, { quoted: msg })
      await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
    }
  }
}