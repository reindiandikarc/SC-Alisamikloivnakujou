import { CHAT } from '../../_runtime/core-shim.js'
import { logger } from '../../_runtime/core-shim.js'

const TWITTER_REGEX = /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+\/status\/\d+/i

async function downloadTwitter(url) {
  const res = await fetch(`https://tweeload.aculix.net/status/?url=${encodeURIComponent(url)}`, {
    headers: {
      'authorization': 'cKMQlY4jGCflOStlN3UfnWCxLQSb5GL7UPjPJ3jGS5fkno1Jaf',
      'user-agent': 'okhttp/4.12.0'
    }
  })

  if (!res.ok) {
    throw new Error(`API request failed with status ${res.status}`)
  }

  const data = await res.json()
  return data.tweet || data
}

export default {
  name: 'twitter',
  command: ['twitter', 'x', 'twit', 'tw'],
  event: [],
  allow: CHAT.BOTH,
  roleRequired: 10,
  category: 'downloader',
  description: 'Download media (video/images) from Twitter/X',

  async handle(ctx) {
    const { sock, msg, args, chat } = ctx
    const url = args.join(' ').trim()

    if (!url || !TWITTER_REGEX.test(url)) {
      return sock.sendMessage(chat, { 
        text: '❌ Please provide a valid Twitter/X URL!\n\n*Example:*\n!x https://x.com/username/status/1234567890' 
      }, { quoted: msg })
    }

    await sock.sendMessage(chat, { react: { text: '⏳', key: msg.key } })

    try {
      const data = await downloadTwitter(url)

      if (!data || !data.author) {
        throw new Error('Failed to fetch tweet data. The tweet might be private or deleted.')
      }

      const caption = `*Twitter / X*\n\n` +
                      `${data.text || 'No text'}\n\n` +
                      `*Author:* ${data.author.name} (@${data.author.screen_name})\n` +
                      `*Likes:* ${data.likes?.toLocaleString() || 0} | *Retweets:* ${data.retweets?.toLocaleString() || 0}`

      if (data.media?.videos && data.media.videos.length > 0) {
        const video = data.media.videos[0]
        const bestQuality = video.video_urls.reduce((prev, current) => 
          (prev.bitrate > current.bitrate) ? prev : current
        )

        await sock.sendMessage(chat, {
          video: { url: bestQuality.url },
          mimetype: 'video/mp4',
          caption: caption
        }, { quoted: msg })
      }
      else if (data.media?.photos && data.media.photos.length > 0) {
        for (let i = 0; i < data.media.photos.length; i++) {
          const photo = data.media.photos[i]
          await sock.sendMessage(chat, {
            image: { url: photo.url },
            mimetype: 'image/jpeg',
            caption: i === 0 ? caption : undefined
          }, { quoted: msg })
          
          if (i < data.media.photos.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
      } 
      else {
        throw new Error('No downloadable media found in this tweet.')
      }

      await sock.sendMessage(chat, { react: { text: '✅', key: msg.key } })

    } catch (error) {
      logger.error('twitter download failed', error)
      await sock.sendMessage(chat, { 
        text: `❌ Failed to download: ${error.message}` 
      }, { quoted: msg })
      await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
    }
  }
}