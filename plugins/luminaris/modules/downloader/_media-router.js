import { createRequire } from 'node:module'
import ytdl from '@pontalabs/ytdl'
import { logger } from '../../_runtime/core-shim.js'

// Router media bersama untuk plugin AIO dan SaveFrom.
//
// Beberapa scraper "all in one" publik sekarang mati atau dipagari
// Cloudflare/Turnstile. Supaya command tetap berguna, AIO memilih pengunduh
// platform yang sudah terbukti dipakai bot ini (TikTok, Facebook, Twitter/X,
// Instagram, YouTube). SaveFrom memakai router yang sama sebagai fallback
// kalau worker SaveFrom tidak mengembalikan hasil.

const require = createRequire(import.meta.url)
const Instagram = require('cakkatrok-instagram-downloader')

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'

const PLATFORM_LABEL = {
  tiktok: 'TikTok',
  facebook: 'Facebook',
  twitter: 'Twitter / X',
  instagram: 'Instagram',
  youtube: 'YouTube'
}

export function detectPlatform(rawUrl) {
  const value = String(rawUrl || '').trim()
  if (!/^https?:\/\//i.test(value)) return null

  let host
  try {
    host = new URL(value).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return null
  }

  if (host === 'tiktok.com' || host.endsWith('.tiktok.com')) return 'tiktok'
  if (host === 'facebook.com' || host.endsWith('.facebook.com') || host === 'fb.watch' || host.endsWith('.fb.watch')) return 'facebook'
  if (host === 'twitter.com' || host.endsWith('.twitter.com') || host === 'x.com' || host.endsWith('.x.com')) return 'twitter'
  if (host === 'instagram.com' || host.endsWith('.instagram.com')) return 'instagram'
  if (host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtu.be' || host.endsWith('.youtu.be')) return 'youtube'
  return null
}

export function platformLabel(platform) {
  return PLATFORM_LABEL[platform] || platform || 'Media'
}

function compact(text, max = 180) {
  const value = String(text || '').replace(/\s+/g, ' ').trim()
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

async function fetchTikTok(url) {
  const res = await fetch('https://www.tikwm.com/api/', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'user-agent': UA
    },
    body: new URLSearchParams({ url }),
    signal: AbortSignal.timeout(30_000)
  })

  const json = await res.json().catch(() => null)
  if (!res.ok || json?.code !== 0 || !json?.data) {
    throw new Error(json?.msg || `TikTok API gagal (HTTP ${res.status}).`)
  }

  const data = json.data
  const items = []
  if (Array.isArray(data.images) && data.images.length) {
    for (const image of data.images.slice(0, 10)) {
      if (image) items.push({ type: 'image', url: image })
    }
  } else {
    const video = data.play || data.hdplay || data.wmplay
    if (video) items.push({ type: 'video', url: video })
  }

  if (!items.length) throw new Error('TikTok tidak mengembalikan media yang bisa diunduh.')

  return {
    platform: 'tiktok',
    title: data.title || 'Video TikTok',
    author: data.author?.unique_id ? `@${data.author.unique_id}` : (data.author?.nickname || ''),
    items,
    audio: Array.isArray(data.images) && data.images.length ? data.music || null : null
  }
}

async function fetchFacebook(url) {
  const res = await fetch('https://api.rifkyshre.biz.id/scrape/facebook', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://code.rifkyshre.biz.id',
      referer: 'https://code.rifkyshre.biz.id/',
      'user-agent': UA
    },
    body: JSON.stringify({ url }),
    signal: AbortSignal.timeout(45_000)
  })

  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.status || !json?.data) {
    throw new Error(json?.error || `Facebook API gagal (HTTP ${res.status}).`)
  }

  const data = json.data
  const video = data.hd || data.sd
  if (!video) throw new Error('Facebook tidak mengembalikan link video.')

  return {
    platform: 'facebook',
    title: data.title || 'Video Facebook',
    author: '',
    description: data.description || '',
    items: [{ type: 'video', url: video }]
  }
}

async function fetchTwitter(url) {
  const res = await fetch(`https://tweeload.aculix.net/status/?url=${encodeURIComponent(url)}`, {
    headers: {
      authorization: 'cKMQlY4jGCflOStlN3UfnWCxLQSb5GL7UPjPJ3jGS5fkno1Jaf',
      'user-agent': 'okhttp/4.12.0'
    },
    signal: AbortSignal.timeout(45_000)
  })

  const json = await res.json().catch(() => null)
  if (!res.ok || !json) throw new Error(`Twitter API gagal (HTTP ${res.status}).`)

  const tweet = json.tweet || json
  if (!tweet?.author) throw new Error('Tweet tidak ditemukan, mungkin private atau sudah dihapus.')

  const items = []
  for (const video of tweet.media?.videos || []) {
    const urls = Array.isArray(video.video_urls) ? video.video_urls : []
    const best = urls.reduce((prev, current) =>
      !prev || (Number(current.bitrate) || 0) > (Number(prev.bitrate) || 0) ? current : prev, null)
    if (best?.url) items.push({ type: 'video', url: best.url })
  }
  for (const photo of tweet.media?.photos || []) {
    if (photo?.url) items.push({ type: 'image', url: photo.url })
  }

  if (!items.length) throw new Error('Tweet tidak berisi media yang bisa diunduh.')

  return {
    platform: 'twitter',
    title: compact(tweet.text || 'Media Twitter / X'),
    author: tweet.author.screen_name ? `@${tweet.author.screen_name}` : (tweet.author.name || ''),
    items
  }
}

async function fetchInstagram(url) {
  const isStory = /\/stories\//i.test(url)
  const result = isStory ? await Instagram.story(url) : await Instagram.media(url)

  if (!result || result.status !== 'ok' || !Array.isArray(result.media) || !result.media.length) {
    throw new Error('Instagram tidak mengembalikan media. Pastikan link valid dan akun tidak private.')
  }

  const items = result.media
    .filter((item) => item?.url)
    .map((item) => ({ type: item.type === 'video' ? 'video' : 'image', url: item.url }))

  if (!items.length) throw new Error('Instagram tidak mengembalikan media yang bisa diunduh.')

  return {
    platform: 'instagram',
    title: isStory ? 'Instagram Story' : 'Instagram Post',
    author: isStory ? compact(url) : '',
    items
  }
}

async function fetchYouTube(url, audio = false) {
  if (audio) {
    const result = await ytdl.downloadAudio(url, 128)
    if (!result?.status || !result?.download?.downloadUrl) {
      throw new Error(result?.message || 'YouTube tidak mengembalikan link audio.')
    }
    return {
      platform: 'youtube',
      title: result.metadata?.title || 'Audio YouTube',
      author: result.metadata?.author?.name || '',
      items: [{ type: 'audio', url: result.download.downloadUrl }]
    }
  }

  const result = await ytdl.downloadVideo(url, 360)
  if (!result?.status || !result?.download?.downloadUrl) {
    throw new Error(result?.message || 'YouTube tidak mengembalikan link video.')
  }

  return {
    platform: 'youtube',
    title: result.metadata?.title || 'Video YouTube',
    author: result.metadata?.author?.name || '',
    items: [{ type: 'video', url: result.download.downloadUrl }]
  }
}

/**
 * Ambil media dari platform yang didukung.
 *
 * @param {string} url
 * @param {{ audio?: boolean }} [options]
 * @returns {Promise<{platform: string, title: string, author?: string, description?: string, items: Array<{type: string, url: string}>, audio?: string|null}>}
 */
export async function resolveMedia(url, options = {}) {
  const platform = detectPlatform(url)
  if (!platform) {
    throw new Error('Platform belum didukung. Kirim link TikTok, Facebook, Twitter/X, Instagram, atau YouTube.')
  }

  switch (platform) {
    case 'tiktok':
      return fetchTikTok(url)
    case 'facebook':
      return fetchFacebook(url)
    case 'twitter':
      return fetchTwitter(url)
    case 'instagram':
      return fetchInstagram(url)
    case 'youtube':
      return fetchYouTube(url, options.audio === true)
    default:
      throw new Error('Platform belum didukung.')
  }
}

export function mediaCaption(media) {
  const lines = [`*${platformLabel(media.platform)}*`]
  if (media.title) lines.push('', compact(media.title, 300))
  if (media.author) lines.push(`👤 ${media.author}`)
  if (media.description) lines.push('', compact(media.description, 220))
  if (media.items.some((item) => item.type === 'image') && media.items.length > 1) {
    lines.push('', `🖼️ ${media.items.length} gambar`)
  }
  return lines.join('\n')
}

/**
 * Kirim seluruh media hasil resolveMedia ke chat. Caption hanya ditempel di
 * item pertama supaya bubble berikutnya tidak penuh teks berulang.
 */
export async function sendResolvedMedia(ctx, media, options = {}) {
  const { sock, chat, msg } = ctx
  const caption = options.caption || mediaCaption(media)
  let sent = 0
  let first = true

  for (const item of media.items.slice(0, options.maxItems || 10)) {
    try {
      if (item.type === 'video') {
        await sock.sendMessage(chat, {
          video: { url: item.url },
          mimetype: 'video/mp4',
          caption: first ? caption : undefined
        }, { quoted: msg })
      } else if (item.type === 'audio') {
        await sock.sendMessage(chat, {
          audio: { url: item.url },
          mimetype: 'audio/mpeg',
          fileName: options.audioFileName || 'audio.mp3'
        }, { quoted: msg })
      } else {
        await sock.sendMessage(chat, {
          image: { url: item.url },
          mimetype: 'image/jpeg',
          caption: first ? caption : undefined
        }, { quoted: msg })
      }
      sent++
      first = false
    } catch (error) {
      logger.warn(`media-router: gagal mengirim ${item.type} (${error.message})`)
    }

    if (sent && sent < media.items.length) {
      await new Promise((resolve) => setTimeout(resolve, 1200))
    }
  }

  if (media.audio) {
    try {
      await sock.sendMessage(chat, {
        audio: { url: media.audio },
        mimetype: 'audio/mpeg',
        fileName: options.audioFileName || 'audio.mp3'
      }, { quoted: msg })
    } catch (error) {
      logger.warn(`media-router: gagal mengirim audio (${error.message})`)
    }
  }

  if (!sent) throw new Error('Media ditemukan, tetapi gagal dikirim ke WhatsApp.')
  return sent
}
