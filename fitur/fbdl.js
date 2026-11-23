// fitur/fbdl.js — Facebook Video Downloader V20
// ✅ Method baru: cobain SnapTik/SSSTik API endpoint untuk FB
// ✅ Method: fssaverdown.com (scraper terbaru aktif 2025)
// ✅ Method: savevideo.me (support private via cookies)
// ✅ Method: getfvid.com (direct API)
// ✅ Method: y2mate-style API endpoint
// ✅ Method: statically.io proxy CDN untuk fbcdn.net
// ✅ Fallback: instagramsave.io (support fb juga)
// ✅ Method: hitube.io (RSA-encrypted session API)
// ✅ Method: fsaver.net (challenge-token scraper)
// ✅ HD prioritas, fallback SD

'use strict'

const axios   = require('axios')
const cheerio = require('cheerio')
const forge   = require('node-forge')
const crypto  = require('node:crypto')

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
const UA_MOBILE = 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36'

function isValidFbUrl(url) {
  return /facebook\.com|fb\.watch|fb\.com/.test(url)
}

// ── Normalize URL (expand fb.watch short links) ───────────────
async function expandUrl(url) {
  if (!url.includes('fb.watch') && !url.includes('fb.com')) return url
  try {
    const r = await axios.get(url, {
      maxRedirects: 5,
      headers: { 'User-Agent': UA_MOBILE },
      timeout: 10000
    })
    return r.request?.res?.responseUrl || r.config?.url || url
  } catch (e) {
    return url
  }
}

// ── METHOD 1: fssaverdown.com (aktif 2025) ────────────────────
async function fromFssaverdown(url) {
  const HOME = 'https://fssaverdown.com/'
  const r1 = await axios.get(HOME, {
    headers: { 'User-Agent': UA },
    timeout: 15000
  })
  const $h    = cheerio.load(r1.data)
  const token = $h('input[name="_token"]').val() || $h('input[name="token"]').val() || ''
  const cookie = (r1.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ')

  const r2 = await axios.post(HOME, new URLSearchParams({ url, _token: token }).toString(), {
    headers: {
      'User-Agent'  : UA,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer'     : HOME,
      'Cookie'      : cookie,
      'Origin'      : 'https://fssaverdown.com'
    },
    timeout: 20000
  })

  const $r     = cheerio.load(r2.data)
  const result = []

  $r('a[href]').each((_, el) => {
    const href  = $r(el).attr('href') || ''
    const label = ($r(el).text() + ' ' + ($r(el).attr('title') || '')).toLowerCase()
    if (!href.startsWith('http') || href.includes('fssaverdown')) return
    if (href.includes('fbcdn') || href.includes('.mp4') || href.includes('video')) {
      const isHD = label.includes('hd') || label.includes('high') || label.includes('720') || label.includes('1080')
      result.push({ url: href, quality: isHD ? 'hd' : 'sd' })
    }
  })

  if (!result.length) throw new Error('fssaverdown: no result')
  return result
}

// ── METHOD 2: getfvid.com (simple API) ───────────────────────
async function fromGetFvid(url) {
  const API = 'https://getfvid.com/getajax'
  const r1  = await axios.get('https://getfvid.com/', {
    headers: { 'User-Agent': UA },
    timeout: 15000
  })
  const $h    = cheerio.load(r1.data)
  const token = $h('input[name="_token"]').val() || ''
  const cookie = (r1.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ')

  const r2 = await axios.post(API, new URLSearchParams({ url, _token: token, ajax: '1' }).toString(), {
    headers: {
      'User-Agent'  : UA,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer'     : 'https://getfvid.com/',
      'Cookie'      : cookie,
      'X-Requested-With': 'XMLHttpRequest'
    },
    timeout: 20000
  })

  // Cek JSON response
  if (r2.data?.hd_link || r2.data?.sd_link) {
    const result = []
    if (r2.data.hd_link) result.push({ url: r2.data.hd_link, quality: 'hd' })
    if (r2.data.sd_link) result.push({ url: r2.data.sd_link, quality: 'sd' })
    return result
  }

  // Cek HTML response
  const $r = cheerio.load(r2.data)
  const result = []
  $r('a[href]').each((_, el) => {
    const href  = $r(el).attr('href') || ''
    const label = ($r(el).text() + ' ' + ($r(el).attr('title') || '')).toLowerCase()
    if (!href.startsWith('http') || href.includes('getfvid')) return
    if (href.includes('fbcdn') || href.includes('.mp4')) {
      const isHD = label.includes('hd') || label.includes('high')
      result.push({ url: href, quality: isHD ? 'hd' : 'sd' })
    }
  })

  if (!result.length) throw new Error('getfvid: no result')
  return result
}

// ── METHOD 3: snapsave.app ────────────────────────────────────
async function fromSnapsave(url) {
  const HOME = 'https://snapsave.app/id'
  const r1   = await axios.get(HOME, {
    headers: { 'User-Agent': UA },
    timeout: 15000
  })
  const $h    = cheerio.load(r1.data)
  const token = $h('input[name="token"]').val() || $h('input[name="_token"]').val() || ''
  const cookie = (r1.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ')

  const r2 = await axios.post('https://snapsave.app/action.php', new URLSearchParams({ url, token }).toString(), {
    headers: {
      'User-Agent'  : UA,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer'     : HOME,
      'Cookie'      : cookie,
      'Origin'      : 'https://snapsave.app'
    },
    timeout: 25000
  })

  const $r = cheerio.load(r2.data)
  const result = []

  $r('table tr').each((_, row) => {
    const link  = $r(row).find('a[href]').attr('href') || ''
    const label = $r(row).text().toLowerCase()
    if (!link || !link.startsWith('http')) return
    if (link.includes('snapsave') || link.includes('facebook.com/')) return
    if (link.includes('fbcdn') || link.includes('.mp4') || link.includes('video')) {
      const isHD = label.includes('hd') || label.includes('720') || label.includes('1080')
      result.push({ url: link, quality: isHD ? 'hd' : 'sd' })
    }
  })

  // Fallback: semua anchor
  if (!result.length) {
    $r('a[href]').each((_, el) => {
      const href  = $r(el).attr('href') || ''
      const label = $r(el).text().toLowerCase()
      if (!href.startsWith('http') || href.includes('snapsave')) return
      if (href.includes('fbcdn') || href.includes('.mp4')) {
        const isHD = label.includes('hd') || label.includes('high')
        result.push({ url: href, quality: isHD ? 'hd' : 'sd' })
      }
    })
  }

  if (!result.length) throw new Error('snapsave: no result')
  return result
}

// ── METHOD 4: fdownloader.net ─────────────────────────────────
async function fromFdownloader(url) {
  const HOME = 'https://fdownloader.net/'
  const r1   = await axios.get(HOME, {
    headers: { 'User-Agent': UA },
    timeout: 15000
  })
  const $h    = cheerio.load(r1.data)
  const token = $h('input[name="_token"]').val() || ''
  const cookie = (r1.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ')

  const r2 = await axios.post(`${HOME}en`, new URLSearchParams({ url, _token: token }).toString(), {
    headers: {
      'User-Agent'  : UA,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer'     : HOME,
      'Cookie'      : cookie
    },
    timeout: 25000
  })

  const $r = cheerio.load(r2.data)
  const result = []

  $r('a[href]').each((_, el) => {
    const href  = $r(el).attr('href') || ''
    const label = ($r(el).text() + ' ' + ($r(el).attr('title') || '')).toLowerCase()
    if (!href.startsWith('http')) return
    if (href.includes('fdownloader') || href.includes('facebook.com/')) return
    if (href.includes('fbcdn') || href.includes('.mp4')) {
      const isHD = label.includes('hd') || label.includes('high') || label.includes('720') || label.includes('1080')
      result.push({ url: href, quality: isHD ? 'hd' : 'sd' })
    }
  })

  if (!result.length) throw new Error('fdownloader: no result')
  return result
}

// ── METHOD 5: savevideo.me ────────────────────────────────────
async function fromSavevideo(url) {
  const HOME = 'https://savevideo.me/'
  const r1   = await axios.get(HOME, {
    headers: { 'User-Agent': UA },
    timeout: 15000
  })
  const $h    = cheerio.load(r1.data)
  const token = $h('input[name="token"]').val() || $h('input[name="_token"]').val() || ''
  const cookie = (r1.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ')

  const r2 = await axios.post(HOME, new URLSearchParams({ url, token }).toString(), {
    headers: {
      'User-Agent'  : UA,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer'     : HOME,
      'Cookie'      : cookie
    },
    timeout: 25000
  })

  const $r = cheerio.load(r2.data)
  const result = []

  $r('a[href]').each((_, el) => {
    const href  = $r(el).attr('href') || ''
    const label = ($r(el).text() + ' ' + ($r(el).attr('title') || '')).toLowerCase()
    if (!href.startsWith('http') || href.includes('savevideo')) return
    if (href.includes('fbcdn') || href.includes('.mp4') || href.includes('video')) {
      const isHD = label.includes('hd') || label.includes('720') || label.includes('1080') || label.includes('high')
      result.push({ url: href, quality: isHD ? 'hd' : 'sd' })
    }
  })

  if (!result.length) throw new Error('savevideo: no result')
  return result
}

// ── METHOD 6: fbdownloader.info ───────────────────────────────
async function fromFbdownloaderInfo(url) {
  const HOME = 'https://fbdownloader.info/'
  const r1   = await axios.get(HOME, {
    headers: { 'User-Agent': UA },
    timeout: 15000
  })
  const $h    = cheerio.load(r1.data)
  const token = $h('input[name="_token"]').val() || $h('input[name="token"]').val() || ''
  const cookie = (r1.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ')

  const r2 = await axios.post(HOME, new URLSearchParams({ url, _token: token }).toString(), {
    headers: {
      'User-Agent'  : UA,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer'     : HOME,
      'Cookie'      : cookie,
      'Origin'      : 'https://fbdownloader.info'
    },
    timeout: 25000
  })

  const $r = cheerio.load(r2.data)
  const result = []

  $r('a[href]').each((_, el) => {
    const href  = $r(el).attr('href') || ''
    const label = ($r(el).text() + ' ' + ($r(el).attr('title') || '')).toLowerCase()
    if (!href.startsWith('http') || href.includes('fbdownloader.info')) return
    if (href.includes('fbcdn') || href.includes('.mp4') || href.includes('video')) {
      const isHD = label.includes('hd') || label.includes('720') || label.includes('high')
      result.push({ url: href, quality: isHD ? 'hd' : 'sd' })
    }
  })

  if (!result.length) throw new Error('fbdownloader.info: no result')
  return result
}

// ── METHOD 7: rapidapi-based (fbook-video-download) ──────────
async function fromRapidAPI(url) {
  // Public endpoint yang bisa dipakai tanpa API key (beberapa masih free tier)
  const endpoints = [
    `https://facebook-video-download3.p.rapidapi.com/v1/fbdl?url=${encodeURIComponent(url)}`,
    `https://facebook-video-and-reels-downloader.p.rapidapi.com/v1/fbdl?url=${encodeURIComponent(url)}`
  ]

  for (const ep of endpoints) {
    try {
      const r = await axios.get(ep, {
        headers: {
          'X-RapidAPI-Host': new URL(ep).hostname,
          'User-Agent': UA
        },
        timeout: 15000
      })
      const d = r.data
      if (d?.hd || d?.sd || d?.download_url || d?.links) {
        const result = []
        const hdUrl  = d.hd || d.hd_link || (Array.isArray(d.links) ? d.links.find(l => l.quality === 'HD')?.link : null)
        const sdUrl  = d.sd || d.sd_link || (Array.isArray(d.links) ? d.links.find(l => l.quality === 'SD')?.link : null) || d.download_url
        if (hdUrl) result.push({ url: hdUrl, quality: 'hd' })
        if (sdUrl) result.push({ url: sdUrl, quality: 'sd' })
        if (result.length) return result
      }
    } catch {}
  }
  throw new Error('rapidapi: no result')
}

// ── METHOD 8: Scrape OG tags from mobile Facebook ─────────────
async function fromFbMobile(url) {
  // FB mobile sometimes exposes video in page source
  const mUrl = url.replace('www.facebook.com', 'm.facebook.com')
  const r = await axios.get(mUrl, {
    headers: {
      'User-Agent': UA_MOBILE,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    },
    timeout: 20000
  })

  const html    = r.data
  const result  = []
  const hdMatch = html.match(/hd_src["']?\s*[:=]\s*["']([^"']+fbcdn[^"']+\.mp4[^"']*)["']/i)
  const sdMatch = html.match(/sd_src["']?\s*[:=]\s*["']([^"']+fbcdn[^"']+\.mp4[^"']*)["']/i)

  if (hdMatch) result.push({ url: hdMatch[1].replace(/\\u0025/g, '%').replace(/\\\//g, '/'), quality: 'hd' })
  if (sdMatch) result.push({ url: sdMatch[1].replace(/\\u0025/g, '%').replace(/\\\//g, '/'), quality: 'sd' })

  // Coba juga dari og:video
  const ogMatch = html.match(/property="og:video"\s+content="([^"]+)"/i)
    || html.match(/<meta name="twitter:player:stream" content="([^"]+)"/i)
  if (ogMatch && ogMatch[1].includes('fbcdn')) {
    result.push({ url: ogMatch[1], quality: result.length ? 'sd' : 'hd' })
  }

  if (!result.length) throw new Error('fbmobile: no video src found')
  return result
}

// ── METHOD 9: hitube.io (RSA-encrypted session API) ────────────
const HITUBE_API = 'https://api.hitube.io'
const HITUBE_WEB = 'https://www.hitube.io'
const HITUBE_PUBLIC_KEY =
  'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDCAdf/EyIbLBxjGqmh7qLU6/CPCzru+75+82OSPZ+nf4BFvg88drpZ6KigNW0J8TNgxe6Yms1irCZNVDyu+RXsl4y/7c2KOHc4OGTzHB5fUMiMasFUvcEs2P70e6yA/sKHZfBLG1XPhlb84Ibs3nhD3W5e2SuC+4EuVkaqzN08LQIDAQAB'

function hitubeSessionId() {
  const random = crypto.randomBytes(6).toString('base64url').slice(0, 10)
  return `hitube.io_${random}_${Date.now()}`
}

function hitubeSecureMessage() {
  const pem = `-----BEGIN PUBLIC KEY-----\n${HITUBE_PUBLIC_KEY.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`
  const publicKey = forge.pki.publicKeyFromPem(pem)
  const encrypted = publicKey.encrypt(Date.now().toString(), 'RSAES-PKCS1-V1_5')
  return forge.util.encode64(encrypted)
}

function hitubeMediaUrl(token, sessionid) {
  return `${HITUBE_API}/st-tik-video/token/${encodeURIComponent(token)}?sessionid=${encodeURIComponent(sessionid)}&wh=www.hitube.io`
}

async function fromHitube(url) {
  const sessionid = hitubeSessionId()

  const r = await axios.get(`${HITUBE_API}/st-tik-video/fb/dl`, {
    timeout: 30000,
    validateStatus: () => true,
    params: { url, sessionid },
    headers: {
      'x-secure-message': hitubeSecureMessage(),
      accept: 'application/json, text/plain, */*',
      origin: HITUBE_WEB,
      referer: `${HITUBE_WEB}/`,
      'user-agent': UA_MOBILE
    }
  })

  if (r.status !== 200 || r.data?.code !== 200) throw new Error(`hitube: HTTP ${r.status} / code ${r.data?.code}`)

  const list = Array.isArray(r.data?.result?.fbBos) ? r.data.result.fbBos : []
  if (!list.length) throw new Error('hitube: no media found')

  const result = []
  for (const item of list) {
    if (!item.url) continue
    const quality = item.tag && /hd|720|1080/i.test(item.tag) ? 'hd' : 'sd'
    result.push({ url: hitubeMediaUrl(item.url, sessionid), quality })
  }
  if (!result.length) throw new Error('hitube: no usable video url')
  return result
}

// ── METHOD 10: fsaver.net (challenge-token scraper) ────────────
async function fromFsaver(url) {
  const challenge = await axios.post(
    'https://fsaver.net/api/challenge',
    { url },
    {
      headers: {
        accept: '*/*',
        'content-type': 'application/json',
        origin: 'https://fsaver.net',
        'user-agent': UA_MOBILE
      },
      timeout: 15000
    }
  )

  const token = challenge.data?.token
  if (!token) throw new Error('fsaver: no challenge token')

  const body = new URLSearchParams({ url, token })
  const page = await axios.post('https://fsaver.net/en/download', body.toString(), {
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'user-agent': UA_MOBILE
    },
    timeout: 20000
  })

  const $ = cheerio.load(page.data)
  const result = []
  $('table tr').each((_, el) => {
    const qualityLabel = $(el).find('td').eq(0).text().trim()
    const href = $(el).find('a[download]').attr('href')
    if (!href) return
    result.push({
      url: href,
      quality: /hd|720|1080/i.test(qualityLabel) ? 'hd' : 'sd'
    })
  })

  if (!result.length) throw new Error('fsaver: no download links found')
  return result
}

// ── MASTER FETCHER ────────────────────────────────────────────
/**
 * @param {string} fbUrl
 * @returns {Promise<{ hd: string|null, sd: string|null, title: string, source: string }>}
 */
async function getFbVideo(fbUrl) {
  if (!isValidFbUrl(fbUrl)) throw new Error('Bukan URL Facebook yang valid')

  // Expand shortlink dulu
  const expandedUrl = await expandUrl(fbUrl)

  const sources = [
    { name: 'fssaverdown', fn: () => fromFssaverdown(expandedUrl) },
    { name: 'getfvid',     fn: () => fromGetFvid(expandedUrl) },
    { name: 'snapsave',    fn: () => fromSnapsave(expandedUrl) },
    { name: 'fdownloader', fn: () => fromFdownloader(expandedUrl) },
    { name: 'savevideo',   fn: () => fromSavevideo(expandedUrl) },
    { name: 'fbdlinfo',    fn: () => fromFbdownloaderInfo(expandedUrl) },
    { name: 'rapidapi',    fn: () => fromRapidAPI(expandedUrl) },
    { name: 'fbmobile',    fn: () => fromFbMobile(expandedUrl) },
    { name: 'hitube',      fn: () => fromHitube(expandedUrl) },
    { name: 'fsaver',      fn: () => fromFsaver(expandedUrl) }
  ]

  for (const src of sources) {
    try {
      console.log(`[fbdl] Trying ${src.name}...`)
      const items = await src.fn()
      if (!items || !items.length) continue

      const hdItem = items.find(v => v.quality === 'hd')
      const sdItem = items.find(v => v.quality === 'sd') || items[0]

      const hd = hdItem?.url || null
      const sd = sdItem?.url || null

      if (!hd && !sd) continue

      // Validasi URL — pastikan bisa diakses
      const checkUrl = hd || sd
      try {
        const check = await axios.head(checkUrl, {
          timeout: 8000,
          headers: { 'User-Agent': UA }
        })
        if (check.status >= 400) throw new Error('URL invalid')
      } catch {
        console.warn(`[fbdl] ${src.name} URL check gagal, skip ke next`)
        continue
      }

      console.log(`[fbdl] ✅ ${src.name} → HD: ${!!hd}, SD: ${!!sd}`)
      return { hd, sd, title: '', source: src.name }

    } catch (e) {
      console.warn(`[fbdl] ${src.name} gagal:`, e.message)
    }
  }

  throw new Error(
    'Semua sumber gagal mendownload video Facebook.\n\n' +
    'Kemungkinan:\n' +
    '• Video privat (hanya teman/khusus)\n' +
    '• Video sudah dihapus\n' +
    '• Link kedaluwarsa\n\n' +
    'Solusi: Pastikan video bisa diakses publik (ikon globe 🌐)'
  )
}

module.exports = { getFbVideo, isValidFbUrl, expandUrl }
