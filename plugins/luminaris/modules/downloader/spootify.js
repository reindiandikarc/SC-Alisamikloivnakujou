import { CHAT, logger } from '../../_runtime/core-shim.js'

const API = 'https://musicfab.io/api/spotify'
const UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36'
const SPOTIFY_URL_RE = /^https?:\/\/open\.spotify\.com\/(?:[a-z-]+\/)?(?:track|album|playlist|episode)\/[A-Za-z0-9]+/i

function helpText(prefix) {
  return [
    '🎵 *SPOOTIFY — SPOTIFY DOWNLOADER*',
    'Unduh lagu dari Spotify dalam format MP3.',
    '',
    '*Cara pakai*',
    `• ${prefix}spootify <link-spotify>`,
    '',
    '*Contoh*',
    `> ${prefix}spootify https://open.spotify.com/track/xxxxx`,
    '',
    '_Mendukung link track. Link album/playlist mengikuti lagu pertama yang dikembalikan server._'
  ].join('\n')
}

export function normalizeSpotifyResponse(json) {
  const metadata = json?.data?.metadata || null
  if (!metadata?.download) {
    return {
      ok: false,
      error: json?.message || json?.error || 'Server tidak mengembalikan link download.'
    }
  }

  return {
    ok: true,
    url: metadata.download,
    metadata: {
      name: metadata.name || 'Tanpa judul',
      artist: metadata.artist || '',
      album: metadata.album || '',
      duration: metadata.duration || '',
      image: metadata.image || ''
    }
  }
}

async function fetchSpotify(url) {
  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'user-agent': UA,
      accept: '*/*',
      'content-type': 'application/json',
      origin: 'https://musicfab.io',
      referer: 'https://musicfab.io/',
      'sec-ch-ua': '"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
    },
    body: JSON.stringify({ url }),
    signal: AbortSignal.timeout(60_000)
  })

  const json = await res.json().catch(() => null)
  if (!res.ok) {
    return { ok: false, error: json?.message || `Server Spotify gagal (HTTP ${res.status}).` }
  }
  return normalizeSpotifyResponse(json)
}

function safeFileName(name, artist) {
  const title = String(name || 'track').replace(/\.mp3$/i, '')
  const value = `${title} - ${artist || 'spotify'}`
    .replace(/[\\/:*?"<>|\r\n]+/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 116)
  return `${value || 'spotify-track'}.mp3`
}

function infoText(metadata) {
  const lines = [
    '🎵 *SPOTIFY DOWNLOADER*',
    '',
    '╭──〔 📋 *INFO LAGU* 〕──⬣',
    `│ 🎤 Judul: ${metadata.name || 'Tidak diketahui'}`,
    `│ 🎙️ Artist: ${metadata.artist || 'Tidak diketahui'}`
  ]
  if (metadata.album) lines.push(`│ 💿 Album: ${metadata.album}`)
  if (metadata.duration) lines.push(`│ ⏱️ Durasi: ${metadata.duration}`)
  lines.push('╰───────────────⬣', '', '⏳ *Mengunduh audio...*')
  return lines.join('\n')
}

export default {
  name: 'spootify',
  command: ['spootify', 'spotifydl', 'spdl', 'musik'],
  event: [],
  allow: CHAT.BOTH,
  roleRequired: 10,
  category: 'downloader',
  description: 'Unduh lagu dari Spotify (URL)',

  async handle(ctx) {
    const prefix = ctx.prefix || '!'
    const url = String(ctx.args[0] || '').trim()

    if (!url) return ctx.reply(helpText(prefix))
    if (!SPOTIFY_URL_RE.test(url)) {
      return ctx.reply([
        '❌ *Link Spotify tidak valid.*',
        '',
        `Contoh: *${prefix}spootify https://open.spotify.com/track/xxxxx*`
      ].join('\n'))
    }

    await ctx.reply.react('🎵')
    await ctx.reply('⏳ *Mengambil data lagu dari Spotify...*')

    const result = await fetchSpotify(url)
    if (!result.ok) {
      await ctx.reply.react('❌')
      return ctx.reply([
        '❌ *Gagal mengambil lagu.*',
        '',
        `> ${result.error}`,
        '',
        '> Pastikan link lagu publik dan coba lagi nanti.'
      ].join('\n'))
    }

    await ctx.reply(infoText(result.metadata))

    let audio = null
    try {
      const res = await fetch(result.url, {
        headers: { 'user-agent': UA },
        signal: AbortSignal.timeout(120_000)
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      audio = Buffer.from(await res.arrayBuffer())
    } catch (error) {
      logger.warn(`spootify: gagal mengunduh audio (${error.message})`)
    }

    if (!audio?.length) {
      await ctx.reply.react('⚠️')
      return ctx.reply([
        '⚠️ *Audio tidak bisa diunduh otomatis.*',
        '',
        `🎵 ${result.metadata.name}`,
        `🎙️ ${result.metadata.artist || '-'}`,
        `🔗 ${result.url}`,
        '',
        '> Buka link di atas untuk mengunduh manual.'
      ].join('\n'))
    }

    try {
      await ctx.sock.sendMessage(ctx.chat, {
        audio,
        mimetype: 'audio/mpeg',
        fileName: safeFileName(result.metadata.name, result.metadata.artist),
        caption: `🎵 *${result.metadata.name}*\n🎙️ ${result.metadata.artist || 'Tidak diketahui'}`
      }, { quoted: ctx.msg })
      await ctx.reply.react('✅')
    } catch (error) {
      logger.error('spootify: gagal mengirim audio', error)
      await ctx.reply.react('❌')
      await ctx.reply(`❌ *Gagal mengirim audio.*\n\n🔗 ${result.url}`)
    }
  }
}

export const __test = {
  normalizeSpotifyResponse,
  safeFileName,
  infoText
}
