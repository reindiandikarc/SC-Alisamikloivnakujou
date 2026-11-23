import ytdl from '@pontalabs/ytdl'
import { CHAT } from '../../_runtime/core-shim.js'
import { logger } from '../../_runtime/core-shim.js'

const YT_URL_RE = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/\S+|youtu\.be\/\S+)/i

function formatViews(n) {
  if (!n) return '?'
  const num = typeof n === 'string' ? parseInt(n, 10) : n
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B'
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
  return String(num)
}

function formatDuration(dur) {
  return dur ? String(dur) : '?'
}

export default {
  name: 'youtube',
  command: ['youtube', 'yt', 'ytdl', 'ytvideo', 'ytaudio', 'ytmp3', 'yta', 'ytsearch', 'yts', 'ytchannel', 'channel', 'channelinfo', 'chinfo', 'ytch', 'channelid'],
  event: [],
  allow: CHAT.BOTH,
  roleRequired: 10,
  category: 'downloader',
  description: 'Download video/audio, search, or get channel info on YouTube',

  async handle(ctx) {
    const { sock, msg, args, chat } = ctx
    const trigger = ctx.trigger.toLowerCase()
    const queryOrUrl = args.join(' ').trim()

    if (trigger === 'ytsearch' || trigger === 'yts') {
      if (!queryOrUrl) {
        return sock.sendMessage(chat, { 
          text: '❌ Masukkan kata kunci pencarian!\nContoh: !ytsearch never gonna give you up' 
        }, { quoted: msg })
      }

      await sock.sendMessage(chat, { react: { text: '🔍', key: msg.key } })

      try {
        const result = await ytdl.searchYouTube(queryOrUrl)
        if (!result.status || !result.results?.length) {
          await sock.sendMessage(chat, { text: '❌ Tidak ditemukan hasil pencarian.' }, { quoted: msg })
          await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
          return
        }

        const videos = result.results.slice(0, 5)
        let text = `*Hasil Pencarian YouTube*\nQuery: _${queryOrUrl}_\n\n`

        videos.forEach((v, i) => {
          text += `*${i + 1}. ${v.title}*\n`
          text += `${v.author || '?'}\n`
          text += `${formatDuration(v.duration)} · ${formatViews(v.views)} views\n`
          text += `${v.url}\n\n`
        })

        await sock.sendMessage(chat, { text }, { quoted: msg })
        await sock.sendMessage(chat, { react: { text: '✅', key: msg.key } })
      } catch (err) {
        logger.error('YouTube search failed', err)
        await sock.sendMessage(chat, { text: '❌ Gagal mencari video. Coba lagi nanti.' }, { quoted: msg })
        await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
      }
      return
    }

    if (trigger === 'ytchannel' || trigger === 'channel' || trigger === 'channelinfo' || trigger === 'chinfo' || trigger === 'ytch' || trigger === 'channelid') {
      if (!queryOrUrl) {
        return sock.sendMessage(chat, {
          text: '❌ Masukkan URL atau username channel YouTube!\nContoh:\n!ytchannel https://youtube.com/@MrBeast\n!ytchannel @MrBeast\n!ytchannel UCX6OQ3DkcsbYNE6H8uQQuVA'
        }, { quoted: msg })
      }

      await sock.sendMessage(chat, { react: { text: '🔍', key: msg.key } })

      try {
        const result = await ytdl.getChannelInfo(queryOrUrl)
        if (!result.status || !result.channelId) {
          await sock.sendMessage(chat, { text: '❌ Tidak dapat mengambil info channel.' }, { quoted: msg })
          await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
          return
        }

        const ch = result
        const subs = formatViews(ch.statistics?.subscribers)
        const views = formatViews(ch.statistics?.views)
        const videos = ch.statistics?.videos ?? '?'

        let text = `*Channel Info - YouTube*\n\n`
        text += `*Nama Channel:* ${ch.title || '?'}\n`
        text += `*Channel ID:* ${ch.channelId || '?'}\n`
        if (ch.username) text += `*Username:* ${ch.username}\n`
        text += `*Status:* ${ch.status ? 'Aktif' : 'Tidak diketahui'}\n`
        text += `*Subscribers:* ${subs}\n`
        text += `*Total Views:* ${views}\n`
        text += `*Total Videos:* ${videos}\n`
        if (ch.publishedDate) {
          text += `*Created At:* ${ch.publishedFormatted || new Date(ch.publishedDate).toLocaleString('id-ID')}\n`
        }
        if (ch.description) {
          const desc = ch.description.length > 300 ? ch.description.slice(0, 297) + '...' : ch.description
          text += `\n*Description:*\n${desc}\n`
        }
        if (ch.banner) text += `\n*Banner:* ${ch.banner}\n`
        if (ch.thumbnails?.[ch.thumbnails.length - 1]?.url) {
          text += `\n*Avatar (High):* ${ch.thumbnails[ch.thumbnails.length - 1].url}`
        }

        const img = ch.thumbnails?.[ch.thumbnails.length - 1]?.url || ch.banner
        if (img) {
          try {
            await sock.sendMessage(chat, {
              image: { url: img },
              caption: text
            }, { quoted: msg })
          } catch {
            await sock.sendMessage(chat, { text }, { quoted: msg })
          }
        } else {
          await sock.sendMessage(chat, { text }, { quoted: msg })
        }
        await sock.sendMessage(chat, { react: { text: '✅', key: msg.key } })
      } catch (err) {
        logger.error('YouTube channel info failed', err)
        await sock.sendMessage(chat, { text: '❌ Gagal mengambil info channel. Pastikan URL/username valid.' }, { quoted: msg })
        await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
      }
      return
    }

    const url = args[0] || ''
    const quality = parseInt(args[1], 10) || (trigger.includes('audio') || trigger.includes('mp3') ? 128 : 360)

    if (!url || !YT_URL_RE.test(url)) {
      const example = trigger.includes('audio') || trigger.includes('mp3') || trigger === 'yta'
        ? '!ytaudio https://youtube.com/watch?v=xxxxx 128' 
        : '!youtube https://youtube.com/watch?v=xxxxx 360'
      return sock.sendMessage(chat, { 
        text: `❌ Kirim link YouTube yaa kak!\nContoh: ${example}` 
      }, { quoted: msg })
    }

    await sock.sendMessage(chat, { react: { text: '⏳', key: msg.key } })

    try {
      if (trigger.includes('audio') || trigger.includes('mp3') || trigger === 'yta') {
        const result = await ytdl.downloadAudio(url, quality)
        if (!result.status) {
          await sock.sendMessage(chat, { text: `❌ ${result.message || 'Gagal mengunduh. Link-nya valid kak?'}` }, { quoted: msg })
          await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
          return
        }

        const { metadata, download } = result
        const title = metadata?.title || 'YouTube Audio'
        const author = metadata?.author?.name || ''
        const caption = `*YouTube Audio*\n\n${title}${author ? `\n${author}` : ''}`

        await sock.sendMessage(chat, {
          document: { url: download.downloadUrl },
          mimetype: 'audio/mpeg',
          fileName: download.filename || `${title}.mp3`,
          caption
        }, { quoted: msg })

      } else {
        const result = await ytdl.downloadVideo(url, quality)
        if (!result.status) {
          await sock.sendMessage(chat, { text: `❌ ${result.message || 'Gagal mengunduh. Link-nya valid kak?'}` }, { quoted: msg })
          await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
          return
        }

        const { metadata, download } = result
        const title = metadata?.title || 'YouTube Video'
        const author = metadata?.author?.name || ''
        const caption = `*YouTube*\n\n${title}${author ? `\n${author}` : ''}`

        await sock.sendMessage(chat, {
          video: { url: download.downloadUrl },
          mimetype: 'video/mp4',
          caption
        }, { quoted: msg })
      }

      await sock.sendMessage(chat, { react: { text: '✅', key: msg.key } })

    } catch (err) {
      logger.error('YouTube download failed', err)
      await sock.sendMessage(chat, { text: '❌ Gagal mengunduh. Coba lagi nanti.' }, { quoted: msg })
      await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
    }
  }
}