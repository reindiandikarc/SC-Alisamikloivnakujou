import { CHAT, logger } from '../../_runtime/core-shim.js'
import {
  detectPlatform,
  mediaCaption,
  resolveMedia,
  sendResolvedMedia
} from './_media-router.js'

const WORKER = 'https://worker.sf-tools.com/savefrom.php'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36'

function extractJsonAfter(text, marker) {
  const start = text.indexOf(marker)
  if (start < 0) return null

  let index = start + marker.length
  while (index < text.length && text[index] !== '{' && text[index] !== '[') index++
  if (index >= text.length) return null

  const open = text[index]
  const close = open === '{' ? '}' : ']'
  let depth = 0
  let inString = false
  let escaped = false

  for (let i = index; i < text.length; i++) {
    const char = text[i]

    if (inString) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === '"') inString = false
      continue
    }

    if (char === '"') {
      inString = true
      continue
    }

    if (char === open) depth++
    else if (char === close) {
      depth--
      if (depth === 0) return text.slice(index, i + 1)
    }
  }

  return null
}

function normalizeUrlList(entry) {
  const rawUrls = Array.isArray(entry?.url)
    ? entry.url
    : entry?.url
      ? [entry.url]
      : []
  const rawQualities = Array.isArray(entry?.quality)
    ? entry.quality
    : entry?.quality
      ? [entry.quality]
      : []

  return rawUrls.map((item, index) => {
    if (typeof item === 'string') {
      return { url: item, quality: rawQualities[index] || `Kualitas ${index + 1}` }
    }
    if (item?.url) {
      return {
        url: item.url,
        quality: item.quality || rawQualities[index] || `Kualitas ${index + 1}`
      }
    }
    return null
  }).filter(Boolean)
}

function normalizeVideoEntry(entry, index) {
  if (!entry || typeof entry !== 'object') return null
  const urls = normalizeUrlList(entry)
  if (!urls.length) return null

  return {
    title: entry.title || entry.name || `Video ${index + 1}`,
    duration: entry.duration || entry.time || '',
    urls
  }
}

export function normalizeSaveFromVideoList(payload) {
  if (!payload) return []

  let entries = []
  if (Array.isArray(payload)) {
    entries = payload
  } else if (Array.isArray(payload.data)) {
    entries = payload.data
  } else if (Array.isArray(payload.videos)) {
    entries = payload.videos
  } else {
    const numericKeys = Object.keys(payload)
      .filter((key) => /^\d+$/.test(key))
      .sort((a, b) => Number(a) - Number(b))
    entries = numericKeys.length ? numericKeys.map((key) => payload[key]) : [payload]
  }

  return entries
    .map((entry, index) => normalizeVideoEntry(entry, index))
    .filter(Boolean)
}

/**
 * Parse respons worker SaveFrom.
 *
 * Respons sukses berbentuk JavaScript yang memanggil
 * `window.parent.sf.videoResult.show({...})`; respons gagal memanggil
 * `showEmptyResult({...})`. Dulu plugin memakai jsdom + vm2 hanya untuk
 * mengeksekusi pembungkus itu. Cukup ambil objek JSON-nya langsung.
 */
export function parseSaveFromResponse(text) {
  const source = String(text || '')
  if (!source.trim()) {
    return { ok: false, empty: false, error: 'SaveFrom mengembalikan respons kosong.' }
  }

  const resultJson = extractJsonAfter(source, 'videoResult.show(')
  if (resultJson) {
    let payload
    try {
      payload = JSON.parse(resultJson)
    } catch {
      return { ok: false, empty: false, error: 'Data SaveFrom tidak bisa dibaca.' }
    }

    const videos = normalizeSaveFromVideoList(payload)
    if (!videos.length) {
      return { ok: false, empty: true, error: 'SaveFrom tidak mengembalikan link download.' }
    }

    return {
      ok: true,
      count: Number(payload?.count) || videos.length,
      videos
    }
  }

  const emptyJson = extractJsonAfter(source, 'showEmptyResult(')
  if (emptyJson) {
    try {
      const payload = JSON.parse(emptyJson)
      return {
        ok: false,
        empty: true,
        error: payload.html || payload.message || 'SaveFrom tidak menemukan video yang bisa diunduh.'
      }
    } catch {
      return { ok: false, empty: true, error: 'SaveFrom tidak menemukan video yang bisa diunduh.' }
    }
  }

  return { ok: false, empty: false, error: 'Format respons SaveFrom tidak dikenali.' }
}

async function fetchSaveFrom(videoUrl) {
  const body = new URLSearchParams({
    sf_url: encodeURI(videoUrl),
    sf_submit: '',
    new: '2',
    lang: 'id',
    app: '',
    country: 'id',
    os: 'Windows',
    browser: 'Chrome',
    channel: ' main',
    'sf-nomad': '1'
  })

  const res = await fetch(WORKER, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      origin: 'https://id.savefrom.net',
      referer: 'https://id.savefrom.net/',
      'user-agent': UA
    },
    body,
    signal: AbortSignal.timeout(35_000)
  })

  const text = await res.text()
  if (!res.ok) {
    throw new Error(`Worker SaveFrom gagal (HTTP ${res.status}).`)
  }

  return parseSaveFromResponse(text)
}

function resultText(video) {
  const lines = [
    '📥 *SAVEFROM.NET*',
    '',
    `🎬 *Judul:* ${video.title || 'Tanpa judul'}`
  ]
  if (video.duration) lines.push(`🕐 *Durasi:* ${video.duration}`)
  lines.push('', '*Link download*')
  for (const item of video.urls.slice(0, 5)) {
    lines.push(`• ${item.quality}: ${item.url}`)
  }
  return lines.join('\n')
}

function helpText(prefix) {
  return [
    '📥 *SAVEFROM.NET DOWNLOADER*',
    'Unduh video dari YouTube, TikTok, Facebook, Instagram, Twitter/X, dan platform lain.',
    '',
    '*Cara pakai*',
    `• ${prefix}savefrom <link>`,
    `• ${prefix}savefrom <link> link — hanya tampilkan link`,
    '',
    '*Contoh*',
    `> ${prefix}savefrom https://youtu.be/xxxxx`,
    `> ${prefix}savefrom https://vt.tiktok.com/xxxxx link`,
    '',
    '_Kalau server SaveFrom sedang bermasalah, bot mencoba pengunduh platform langsung._'
  ].join('\n')
}

export default {
  name: 'savefrom',
  command: ['savefrom', 'sf', 'sfdownload', 'savefromnet'],
  event: [],
  allow: CHAT.BOTH,
  roleRequired: 10,
  category: 'downloader',
  description: 'Unduh video dari banyak platform via SaveFrom.net',

  async handle(ctx) {
    const prefix = ctx.prefix || '!'
    const url = String(ctx.args[0] || '').trim()

    if (!url) return ctx.reply(helpText(prefix))

    if (!/^https?:\/\//i.test(url)) {
      return ctx.reply([
        '❌ *Link tidak valid.*',
        '',
        `Contoh: *${prefix}savefrom https://youtu.be/xxxxx*`
      ].join('\n'))
    }

    const linkOnly = /^(link|links|url)$/i.test(String(ctx.args[1] || '').trim())

    await ctx.reply.react('⏳')
    await ctx.reply('⏳ *Memproses link lewat SaveFrom...*')

    let result = null
    try {
      result = await fetchSaveFrom(url)
    } catch (error) {
      logger.warn(`savefrom: worker gagal (${error.message})`)
      result = { ok: false, error: error.message }
    }

    if (result?.ok && result.videos?.length) {
      const video = result.videos[0]
      const best = video.urls[video.urls.length - 1]
      const text = resultText(video)

      if (linkOnly) {
        await ctx.reply.react('✅')
        return ctx.reply(text)
      }

      await ctx.reply(text)

      try {
        await ctx.sock.sendMessage(ctx.chat, {
          video: { url: best.url },
          mimetype: 'video/mp4',
          caption: `✅ *SaveFrom*\n\n${video.title || 'Video'}${video.duration ? `\n🕐 ${video.duration}` : ''}`
        }, { quoted: ctx.msg })
        await ctx.reply.react('✅')
        return
      } catch (error) {
        logger.warn(`savefrom: gagal mengirim video (${error.message})`)
        await ctx.reply.react('⚠️')
        return ctx.reply('⚠️ *Video tidak bisa dikirim otomatis.*\n\nSilakan pakai salah satu link di atas.')
      }
    }

    // Worker SaveFrom sering menolak request dari IP datacenter. Kalau
    // platformnya dikenal, pakai pengunduh platform yang sama seperti AIO.
    const platform = detectPlatform(url)
    if (platform) {
      await ctx.reply('⚠️ *SaveFrom tidak mengembalikan hasil.*\n\nMencoba pengunduh platform langsung...')
      try {
        const media = await resolveMedia(url)
        await sendResolvedMedia(ctx, media, { caption: mediaCaption(media) })
        await ctx.reply.react('✅')
        return
      } catch (error) {
        logger.error('savefrom: fallback platform gagal', error)
        await ctx.reply.react('❌')
        return ctx.reply([
          '❌ *Gagal mengunduh video.*',
          '',
          `> ${error.message}`,
          '',
          '> Coba lagi nanti atau gunakan perintah platform seperti tiktok, instagram, atau youtube.'
        ].join('\n'))
      }
    }

    await ctx.reply.react('❌')
    return ctx.reply([
      '❌ *SaveFrom gagal memproses link.*',
      '',
      `> ${result?.error || 'Tidak ada link download yang ditemukan.'}`,
      '',
      '> Pastikan link publik dan platformnya didukung.'
    ].join('\n'))
  }
}

export const __test = {
  extractJsonAfter,
  normalizeSaveFromVideoList,
  parseSaveFromResponse
}
