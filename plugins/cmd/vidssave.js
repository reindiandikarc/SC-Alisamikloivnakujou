// Plugin: vidssave
// Commands: vdl, vidssave
// Universal video downloader via vidssave.com
// Mendukung: TikTok, Instagram, YouTube, Facebook, Twitter/X, dll.

'use strict'

const axios = require('axios')

// ─── vidssave client (ported from standalone script) ──────────────────────
const VS_CONFIG = {
  apiUrl    : 'https://api.vidssave.com/api/contentsite_api/media/parse',
  websiteUrl: 'https://vidssave.com',
  domain    : 'api-ak.vidssave.com'
}

const UA_LIST = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
]

const randUA    = () => UA_LIST[Math.floor(Math.random() * UA_LIST.length)]
const fmtSize   = (b) => {
  if (!b) return '0 B'
  const k = 1024, s = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(b) / Math.log(k))
  return (b / Math.pow(k, i)).toFixed(2) + ' ' + s[i]
}

async function extractAuth (ua) {
  try {
    const { data: html } = await axios.get(VS_CONFIG.websiteUrl, {
      headers: { 'User-Agent': ua, Accept: 'text/html' },
      timeout: 30000
    })
    const patterns = [
      /auth['":\s]+['"](\d{8}[a-z]{7})['"]/i,
      /auth\s*=\s*['"](\d{8}[a-z]{7})['"]/i,
      /['"]auth['"]\s*:\s*['"](\d{8}[a-z]{7})['"]/i,
      /data-auth=['"](\d{8}[a-z]{7})['"]/i,
      /(?:var|let|const)\s+auth\s*=\s*['"](\d{8}[a-z]{7})['"]/i
    ]
    for (const p of patterns) {
      const m = html.match(p)
      if (m?.[1]) return m[1]
    }
  } catch {}
  return null
}

async function parseVidssave (url) {
  const ua   = randUA()
  const auth = await extractAuth(ua)
  if (!auth) return { success: false, error: 'Gagal extract auth key dari vidssave.com' }

  try {
    const params = new URLSearchParams({ auth, domain: VS_CONFIG.domain, origin: 'source', link: url })
    const { data } = await axios.post(VS_CONFIG.apiUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent'  : ua,
        Accept        : 'application/json, text/plain, */*',
        Origin        : VS_CONFIG.websiteUrl,
        Referer       : VS_CONFIG.websiteUrl + '/'
      },
      timeout: 60000
    })

    if (data?.status !== 1) {
      return { success: false, error: data?.msg || data?.message || 'Unknown API error' }
    }

    const d      = data.data
    const videos = []
    const audios = []

    if (Array.isArray(d.media)) {
      for (const m of d.media) {
        if (m.type === 'video' && m.resources) {
          for (const r of m.resources) {
            if (r.download_url) videos.push({
              quality: r.quality || 'unknown',
              format : r.format  || 'MP4',
              size   : fmtSize(r.size),
              url    : r.download_url
            })
          }
        } else if (m.type === 'audio' && m.resources) {
          for (const r of m.resources) {
            if (r.download_url) audios.push({
              quality: r.quality || 'unknown',
              format : r.format  || 'MP3',
              size   : fmtSize(r.size),
              url    : r.download_url
            })
          }
        }
      }
    }

    videos.sort((a, b) => (parseInt(b.quality) || 0) - (parseInt(a.quality) || 0))

    return {
      success  : true,
      title    : d.title    || 'No Title',
      thumbnail: d.thumbnail || null,
      duration : d.duration  || 0,
      videos,
      audios
    }
  } catch (e) {
    return { success: false, error: e.response ? `HTTP ${e.response.status}` : e.message }
  }
}

// ─── Plugin handler ───────────────────────────────────────────────────────
const _lock = new Set()

module.exports = {
  command: ['vdl', 'vidssave', 'aiovid', 'unduh'],
  tags: ['downloader'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, replyalya } = ctx

    const msgKey = m.key?.id || `${m.chat}_${m.messageTimestamp}`
    if (_lock.has(msgKey)) return
    _lock.add(msgKey)
    setTimeout(() => _lock.delete(msgKey), 120_000)

    try {
      const url = (text || '').trim()

      if (!url) {
        return replyalya(
          `╭━━━〔 🌐 *VIDSSAVE DOWNLOADER* 〕━━━⬣\n` +
          `┃\n` +
          `┃ Universal video downloader.\n` +
          `┃ Mendukung: TikTok, IG, YouTube,\n` +
          `┃ Facebook, Twitter/X, dan 100+ situs.\n` +
          `┃\n` +
          `┃ *Format:*\n` +
          `┃ ${prefix + command} <link>\n` +
          `┃\n` +
          `┃ *Contoh:*\n` +
          `┃ ${prefix + command} https://vt.tiktok.com/xxx\n` +
          `┗━━━━━━━━━━━━━━━━━━━━━━━━━⬣`
        )
      }

      // Validasi URL sederhana
      if (!/^https?:\/\//i.test(url)) {
        return replyalya('❌ URL tidak valid. Pastikan diawali https://')
      }

      // Limit check
      const user  = global.db?.users?.[m.sender]
      const biaya = 3
      if ((user?.limit ?? 0) < biaya) {
        return m.reply(`*AKSES DITOLAK*\n\nLimit tidak mencukupi.\n\n• Dibutuhkan : ${biaya}\n• Sisa Limit : ${user?.limit ?? 0}`)
      }

      await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
      await m.reply(`⬇️ *Mengambil video...*\n\n🔗 ${url}\n\n_Mohon tunggu~_`)

      const result = await parseVidssave(url)

      if (!result.success) {
        await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return replyalya(`❌ *Gagal download:* ${result.error}`)
      }

      if (!result.videos.length && !result.audios.length) {
        await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return replyalya('❌ Tidak ditemukan media yang bisa didownload dari link ini.')
      }

      const best = result.videos[0] || result.audios[0]
      const isVideo = result.videos.length > 0

      const durationFmt = result.duration
        ? `${Math.floor(result.duration / 60)}m ${result.duration % 60}s`
        : 'N/A'

      const caption =
        `${isVideo ? '🎬' : '🎵'} *VIDSSAVE DOWNLOADER*\n\n` +
        `📌 *Judul    :* ${result.title}\n` +
        `⏱️ *Durasi   :* ${durationFmt}\n` +
        `🎞️ *Kualitas :* ${best.quality}${isVideo ? 'p' : ''} (${best.format})\n` +
        `📦 *Ukuran   :* ${best.size}\n\n` +
        `━━━━━━━━━━━━━━━\n` +
        `💳 Biaya  : -${biaya} Limit\n` +
        `📊 Sisa   : ${(user?.limit ?? biaya) - biaya} Limit`

      if (isVideo) {
        await alya.sendMessage(m.chat, {
          video  : { url: best.url },
          caption,
          mimetype: 'video/mp4'
        }, { quoted: m })
      } else {
        await alya.sendMessage(m.chat, {
          audio   : { url: best.url },
          caption,
          mimetype: 'audio/mpeg',
          ptt     : false
        }, { quoted: m })
      }

      if (user) user.limit -= biaya
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (e) {
      console.error('[vidssave]', e.message)
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      m.reply(`❌ *Error:* ${e.message}`)
    } finally {
      _lock.delete(msgKey)
    }
  }
}
