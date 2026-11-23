/*
 * Christy AI WhatsApp Bot
 * Bot       : Christy MD
 * Developer : Riki
 * Library   : @itsliaaa/baileys
 * Module    : ESM Plugin
 *
 * PLUGIN    : TikTok tth
 *             Auto Detect + NativeFlowMessage UI + CN Keyword
 */

import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys'

/* ============================ KONFIG ============================ */

const TIMEOUT_OEMBED = Number(process.env.TTH_TIMEOUT_OEMBED) || 12000
const TIMEOUT_PAGE = Number(process.env.TTH_TIMEOUT_PAGE) || 20000
const MAX_REDIRECT = 3
const CAPTION_MAX = 180

const UA_DESKTOP = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
const UA_MOBILE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
const ACCEPT_LANGUAGE = 'en-US,en;q=0.9,id;q=0.8'
const DEFAULT_THUMBNAIL = 'https://telegra.ph/file/0b32e0a0bb025071120b0.jpg'

// Perbaikan 1: Menambahkan karakter ? di dalam Regex hashtag
const HASHTAG_REGEX = /(?<![\p{L}\p{N}_/.#?])(?<!\p{N})#([\p{L}\p{N}_?]{1,100})(?![\p{L}\p{N}_?])/gu
const SHORTLINK_REGEX = /^https?:\/\/(?:vm|vt)\.tiktok\.com\/[A-Za-z0-9]+\/?/i
const VIDEO_URL_REGEX = /https?:\/\/(?:www\.|m\.|web\.|id\.)?tiktok\.com\/@([A-Za-z0-9._-]+)\/(?:video|photo)\/(\d{6,25})/i

/* ============================ UTILITAS ============================ */

async function getFetch() {
  if (typeof globalThis.fetch === 'function') {
    return globalThis.fetch.bind(globalThis)
  }
  try {
    const mod = await import('node-fetch')
    const fn = mod.default || mod
    if (typeof fn === 'function') return fn
  } catch {}
  throw new TiktokError('Runtime bot belum mendukung fetch. Gunakan Node.js 18 ke atas, atau pasang node-fetch.', 'FAILED')
}

function withTimeout(ms) {
  const controller = new AbortController()
  const timer = setTimeout(() => { controller.abort() }, ms)
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer)
  }
}

class TiktokError extends Error {
  constructor(message, kind = 'FAILED') {
    super(message)
    this.name = 'TiktokError'
    this.kind = kind
  }
}

function decodeEntities(text) {
  if (typeof text !== 'string' || !text) return ''
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

  return text
    .replace(/&#x([0-9a-f]{1,6});/gi, (_match, hex) => {
      const code = parseInt(hex, 16)
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ''
    })
    .replace(/&#(\d{1,7});/g, (_match, decimal) => {
      const code = Number(decimal)
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ''
    })
    .replace(/&([a-z]+[0-9]?);/gi, (match, name) => named[name.toLowerCase()] ?? match)
    .replace(/\s+/g, ' ')
    .trim()
}

const POST_TIMEZONE = process.env.TTH_TIMEZONE || 'Asia/Jakarta'

function formatCreateTime(value) {
  const timestamp = Number(value)
  if (!Number.isFinite(timestamp) || timestamp <= 0) return ''

  const date = new Date(timestamp * 1000)
  if (Number.isNaN(date.getTime())) return ''

  const formatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: POST_TIMEZONE,
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  })

  return formatter.format(date).replace(',', '')
}

function clip(text, max = CAPTION_MAX) {
  const str = String(text ?? '').replace(/\s+/g, ' ').trim()
  if (!str) return ''
  if (str.length <= max) return str

  const cut = str.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max - 40 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

/* ============================ HASHTAG ============================ */

export function extractHashtags(text) {
  if (typeof text !== 'string' || !text.trim()) return []

  const result = []
  const seen = new Set()
  let match

  HASHTAG_REGEX.lastIndex = 0
  while ((match = HASHTAG_REGEX.exec(text)) !== null) {
    const raw = match[1]
    if (!raw || !/[^\d_?]/u.test(raw)) continue // Perbaikan regex ?

    const tag = `#${raw.replace(/_+$/u, '')}`
    const key = tag.toLowerCase()

    if (seen.has(key)) continue
    seen.add(key)
    result.push(tag)
    if (result.length >= 60) break
  }
  return result
}

function mergeHashtags(caption, structured) {
  const base = extractHashtags(caption)
  // Perbaikan regex agar ? tidak direplace
  const keyOf = name => name.toLowerCase().replace(/[^\p{L}\p{N}_?]+/gu, '')
  const seen = new Set(base.map(tag => keyOf(tag.slice(1))))

  for (const raw of Array.isArray(structured) ? structured : []) {
    const name = typeof raw === 'string' ? raw.trim().replace(/^#/, '') : ''
    if (!name || !/[^\d_?]/u.test(name)) continue // Perbaikan regex ?

    const key = keyOf(name)
    if (!key || seen.has(key)) continue

    seen.add(key)
    base.push(`#${name.replace(/_+$/u, '')}`)
    if (base.length >= 60) break
  }
  return base
}

function processCustomHashtags(extractedHashtags, customTags = []) {
  const lowerExtracted = extractedHashtags.map(t => t.toLowerCase())
  const finalHashtags = [...extractedHashtags]
  const customStatus = []

  for (const tag of customTags) {
    const lowerTag = tag.toLowerCase()
    if (lowerExtracted.includes(lowerTag)) {
      customStatus.push(`✅ ${tag} Terdeteksi!`)
    } else {
      // Perbaikan 2: Tidak di-push ke finalHashtags dan mengubah status ke ❌
      customStatus.push(`❌ ${tag} Tidak Terdeteksi!`)
    }
  }

  return { finalHashtags, customStatus }
}

/* ============================ VALIDASI URL ============================ */

export function validateTiktokUrl(input) {
  const raw = typeof input === 'string' ? input.trim() : ''
  if (!raw) return { ok: false, reason: 'EMPTY' }

  const token = raw.match(SHORTLINK_REGEX)?.[0] || raw.match(VIDEO_URL_REGEX)?.[0] || raw.split(/\s+/)[0] || ''
  let candidate = token.trim()

  if (!/^https?:\/\//i.test(candidate)) {
    if (/^[\w.-]*tiktok\.com\//i.test(candidate)) {
      candidate = `https://${candidate}`
    } else {
      return { ok: false, reason: 'NOT_TIKTOK' }
    }
  }

  let url
  try {
    url = new URL(candidate)
  } catch {
    return { ok: false, reason: 'NOT_TIKTOK' }
  }

  if (!/(^|\.)tiktok\.com$/i.test(url.hostname)) return { ok: false, reason: 'NOT_TIKTOK' }

  if (/^(vm|vt)\.tiktok\.com$/i.test(url.hostname)) {
    return { ok: true, kind: 'short', url: url.toString() }
  }

  const video = candidate.match(VIDEO_URL_REGEX)
  if (video) {
    return { ok: true, kind: 'video', username: video[1], videoId: video[2], url: candidate }
  }

  return { ok: false, reason: 'NOT_VIDEO' }
}

/* ============================ HTTP ============================ */

async function httpGet(url, { timeout = TIMEOUT_PAGE, ua = UA_DESKTOP, redirect = 'follow' } = {}) {
  const doFetch = await getFetch()
  const { signal, clear } = withTimeout(timeout)

  try {
    return await doFetch(url, {
      method: 'GET',
      redirect,
      signal,
      headers: {
        'User-Agent': ua,
        'Accept': 'text/html,application/json,*/*',
        'Accept-Language': ACCEPT_LANGUAGE
      }
    })
  } catch (err) {
    if (err?.name === 'AbortError' || err?.name === 'TimeoutError') {
      throw new TiktokError('timeout', 'TIMEOUT')
    }
    throw new TiktokError(err?.message || 'network error', 'FAILED')
  } finally {
    clear()
  }
}

/* ============================ SHORTLINK ============================ */

async function resolveShortLink(shortUrl) {
  let current = shortUrl

  for (let i = 0; i <= MAX_REDIRECT; i += 1) {
    const res = await httpGet(current, { timeout: TIMEOUT_OEMBED, redirect: 'manual' })
    const location = res.headers?.get?.('location') || ''

    if (res.status >= 300 && res.status < 400 && location) {
      current = new URL(location, current).toString()
      const direct = current.match(VIDEO_URL_REGEX)
      if (direct) return { url: current, username: direct[1], videoId: direct[2] }
      continue
    }

    const direct = current.match(VIDEO_URL_REGEX)
    if (direct) return { url: current, username: direct[1], videoId: direct[2] }

    throw new TiktokError('shortlink tidak mengarah ke video', 'INVALID_URL')
  }

  throw new TiktokError('shortlink terlalu banyak redirect', 'INVALID_URL')
}

/* ============================ TIKTOK OEMBED ============================ */

async function fetchFromOEmbed(videoUrl) {
  const endpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`
  const res = await httpGet(endpoint, { timeout: TIMEOUT_OEMBED, ua: UA_MOBILE })
  const body = await res.text().catch(() => '')

  if (res.status === 400 || res.status === 404) throw new TiktokError(`oembed ${res.status}`, 'NOT_FOUND')
  if (!res.ok) throw new TiktokError(`oembed ${res.status}`, 'HTTP')
  if (!body.trim()) throw new TiktokError('oembed kosong', 'EMPTY')

  let json
  try {
    json = JSON.parse(body)
  } catch {
    throw new TiktokError('oembed bukan JSON', 'EMPTY')
  }

  const caption = typeof json?.title === 'string' ? decodeEntities(json.title) : ''
  const username = (typeof json?.author_unique_id === 'string' && json.author_unique_id) 
    ? json.author_unique_id 
    : String(json?.author_url || '').match(/@([A-Za-z0-9._-]+)/)?.[1] || ''
  const thumbnail = json?.thumbnail_url || ''

  if (!caption && !username) throw new TiktokError('oembed tanpa data', 'EMPTY')

  return {
    source: 'oEmbed',
    caption,
    username,
    nickname: '',
    postedAt: '',
    hashtags: extractHashtags(caption),
    thumbnail,
    url: videoUrl
  }
}

/* ============================ TIKTOK PAGE ============================ */

async function fetchFromPage(videoUrl) {
  const attempts = [
    { ua: UA_DESKTOP, timeout: TIMEOUT_PAGE },
    { ua: UA_MOBILE, timeout: TIMEOUT_PAGE }
  ]

  let lastError = new TiktokError('tidak ada percobaan', 'FAILED')

  for (const attempt of attempts) {
    try {
      const res = await httpGet(videoUrl, attempt)
      const status = res.status
      const html = (await res.text().catch(() => '')) || ''

      if (status === 404) throw new TiktokError('halaman 404', 'NOT_FOUND')
      if (!res.ok) throw new TiktokError(`halaman ${status}`, 'HTTP')
      if (!html.trim()) throw new TiktokError('halaman kosong', 'EMPTY')

      let caption = ''
      let username = ''
      let nickname = ''
      let thumbnail = ''
      const structured = []

      const universalMatch = /<script[^>]*id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/i.exec(html)
      if (universalMatch) {
        try {
          const uni = JSON.parse(universalMatch[1].trim())
          const detail = uni?.__DEFAULT_SCOPE__?.['webapp.video-detail'] || uni?.['webapp.video-detail'] || null
          const item = detail?.itemInfo?.itemStruct || (uni?.ItemModule ? Object.values(uni.ItemModule)[0] : null)

          if (item) {
            caption = typeof item.desc === 'string' ? item.desc.trim() : ''
            username = typeof item.author?.uniqueId === 'string' ? item.author.uniqueId : ''
            nickname = typeof item.author?.nickname === 'string' ? item.author.nickname : ''
            thumbnail = item.video?.cover || item.video?.originCover || ''

            if (Array.isArray(item.textExtra)) {
              item.textExtra.forEach(e => {
                if (e?.hashtagName) structured.push(String(e.hashtagName))
              })
            }

            return {
              source: 'UNIVERSAL',
              caption,
              username,
              nickname,
              postedAt: formatCreateTime(item.createTime),
              hashtags: mergeHashtags(caption, structured),
              thumbnail,
              url: videoUrl
            }
          }
        } catch {}
      }

      if (caption || username) {
        return {
          source: 'PAGE', caption, username, nickname, postedAt: '',
          hashtags: mergeHashtags(caption, structured),
          thumbnail, url: videoUrl
        }
      }

      lastError = new TiktokError(`halaman ${status} tanpa data video`, 'EMPTY')
    } catch (err) {
      lastError = err instanceof TiktokError ? err : new TiktokError(err?.message || 'unknown', 'FAILED')
      if (lastError.kind === 'NOT_FOUND' || lastError.kind === 'BLOCKED') throw lastError
    }
  }

  throw lastError
}

/* ============================ GET TIKTOK INFO ============================ */

export async function getTiktokInfo(input) {
  const check = validateTiktokUrl(input)
  if (!check.ok) throw new TiktokError(check.reason, check.reason === 'EMPTY' ? 'EMPTY_INPUT' : 'INVALID_URL')

  let videoUrl = check.url
  let usernameFromUrl = check.username || ''
  let videoId = check.videoId || ''

  if (check.kind === 'short') {
    const resolved = await resolveShortLink(check.url)
    videoUrl = resolved.url
    usernameFromUrl = usernameFromUrl || resolved.username
    videoId = resolved.videoId || videoId
  }

  let pageError = null

  try {
    const page = await fetchFromPage(videoUrl)
    if (!page.username) page.username = usernameFromUrl
    return { ...page, videoId, url: videoUrl }
  } catch (err) {
    pageError = err instanceof TiktokError ? err : new TiktokError(err?.message || 'unknown', 'FAILED')
    if (pageError.kind === 'NOT_FOUND') throw pageError
  }

  try {
    const oembed = await fetchFromOEmbed(videoUrl)
    if (!oembed.username && usernameFromUrl) oembed.username = usernameFromUrl
    if (!oembed.caption && oembed.hashtags.length) oembed.caption = oembed.hashtags.join(' ')
    return { ...oembed, videoId, url: videoUrl }
  } catch (err) {
    const oembedError = err instanceof TiktokError ? err : new TiktokError(err?.message || 'unknown', 'FAILED')
    if (oembedError.kind === 'NOT_FOUND') throw oembedError
    throw pageError || oembedError
  }
}

/* ============================ ERROR ============================ */

function humanizeError(err) {
  const kind = err instanceof TiktokError ? err.kind : 'FAILED'
  const fallback = '\n«Coba periksa kembali link TikTok atau coba beberapa saat lagi.»'

  switch (kind) {
    case 'EMPTY_INPUT':
      return '❌ Link TikTok belum dikirim.\n«Contoh: .tth https://www.tiktok.com/@user/video/123456789»'
    case 'INVALID_URL':
      return '❌ Link TikTok tidak valid.\n«Gunakan link video TikTok.»'
    case 'NOT_FOUND':
      return '❌ Video TikTok tidak ditemukan.\n«Video mungkin sudah dihapus atau diprivat.»'
    case 'TIMEOUT':
      return '❌ Request ke TikTok melebihi batas waktu.\n«Jaringan TikTok sedang lambat.»'
    default:
      return `❌ Gagal mengambil data TikTok.${fallback}`
  }
}

/* ============================ FIND URL ============================ */

function findUrlInText(...sources) {
  for (const source of sources) {
    if (typeof source !== 'string' || !source) continue
    const short = source.match(SHORTLINK_REGEX)
    if (short) return short[0]
    const video = source.match(VIDEO_URL_REGEX)
    if (video) return video[0]
    const any = source.match(/https?:\/\/\S+/i)
    if (any) return any[0]
  }
  return ''
}

/* ============================ NATIVE FLOW ============================ */

async function sendTthAutoStyle(conn, m, data, customStatus, chatConfig, checkUrl) {
  const captionText = clip(data?.caption || '-')
  const nicknameText = data?.nickname || data?.username || '-'
  const usernameText = data?.username ? `@${data.username}` : '-'
  const postedAtText = data?.postedAt || '-'

  // LOGIKA DETEKSI CN KEYWORD PADA NICKNAME
  let cnKeywordStr = ''
  if (chatConfig?.cnKeywords?.length > 0) {
    const nicknameLower = nicknameText.toLowerCase()
    const matchedKeyword = chatConfig.cnKeywords.find(kw => nicknameLower.includes(kw.toLowerCase()))
    
    if (matchedKeyword) {
      cnKeywordStr = `• ✅ CN Keyword cocok: ${matchedKeyword}`
    } else {
      cnKeywordStr = `• ❌ CN Keyword tidak terdeteksi!`
    }
  }

  const statusText = customStatus.length > 0 ? customStatus.map(s => `• ${s}`).join('\n') : '• ➖ Tidak ada target hashtag yang di-set'
  const finalStatus = cnKeywordStr ? `${statusText}\n${cnKeywordStr}` : statusText

  const contentText =
    `${finalStatus}\n\n` +
    `• Caption: ${captionText}\n\n` +
    `• Nickname: ${nicknameText}\n` +
    `• Username: ${usernameText}\n` +
    `• Diposting pada: ${postedAtText}`

  const videoUrl = data?.url || checkUrl || 'https://www.tiktok.com'
  const profileUrl = data?.username ? `https://www.tiktok.com/@${data.username}` : 'https://www.tiktok.com'
  const thumbnail = data?.thumbnail || DEFAULT_THUMBNAIL

  try {
    const media = await prepareWAMessageMedia(
      { image: { url: thumbnail } },
      { upload: conn.waUploadToServer }
    )

    const message = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: {
              title: '✦ TIKTOK DETECTOR ✦',
              subtitle: nicknameText,
              hasMediaAttachment: true,
              imageMessage: media.imageMessage
            },
            body: { text: contentText },
            footer: { text: '❀ vanXone' },
            nativeFlowMessage: {
              buttons: [
                {
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({ display_text: `Kunjungi VT ${nicknameText}`, url: videoUrl })
                },
                {
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({ display_text: `View Profile ${nicknameText}`, url: profileUrl })
                }
              ]
            }
          }
        }
      }
    }, { quoted: m })

    return await conn.relayMessage(m.chat, message.message, { messageId: message.key.id })

  } catch (error) {
    console.error('[TTH NATIVE FLOW]', error)

    /* FALLBACK: Kalau fork Baileys tidak support Native Flow / media upload. */
    try {
      return await conn.sendMessage(
        m.chat,
        { image: { url: thumbnail }, caption: contentText, footer: '✦ TIKTOK DETECTOR ✦' },
        { quoted: m }
      )
    } catch {
      return await m.reply(contentText)
    }
  }
}

/* ============================ CORE ============================ */

async function executeTth(m, input, conn, chatConfig) {
  const react = emoji => {
    try {
      if (typeof m?.react === 'function') return m.react(emoji)
      if (conn && m?.key) return conn.sendMessage(m.chat || m.key.remoteJid, { react: { text: emoji, key: m.key } })
    } catch {}
    return Promise.resolve()
  }

  const reply = message => typeof m?.reply === 'function' ? m.reply(message) : Promise.resolve()

  const check = validateTiktokUrl(input)
  if (!check.ok) {
    await react('❌')
    return reply(
      check.reason === 'NOT_TIKTOK' || check.reason === 'NOT_VIDEO'
        ? '❌ Link yang dikirim bukan video TikTok valid.'
        : humanizeError(new TiktokError('', 'EMPTY_INPUT'))
    )
  }

  await react('🕒')

  try {
    const data = await getTiktokInfo(check.url)
    await react('✅')

    const customTags = chatConfig.tthTags || []
    const { finalHashtags, customStatus } = processCustomHashtags(data.hashtags || [], customTags)
    data.hashtags = finalHashtags

    // Passing chatConfig sebagai parameter kelima
    return await sendTthAutoStyle(conn, m, data, customStatus, chatConfig, data?.url || check.url)
  } catch (err) {
    await react('❌')
    return reply(humanizeError(err))
  }
}

/* ============================ HANDLER ============================ */

const handler = async (m, { conn, text, usedPrefix, command, args }) => {
  const prefix = usedPrefix || '.'
  const cmd = command || 'tth'
  const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})

  /* Default config - Inisialisasi CN Keywords */
  if (!chat.tthTags) chat.tthTags = []
  if (!chat.cnKeywords) chat.cnKeywords = []
  if (typeof chat.tthAuto === 'undefined') chat.tthAuto = false

  const action = args?.[0]?.toLowerCase()

  /* AUTO ON */
  if (action === 'on') {
    chat.tthAuto = true
    return m.reply('✅ Fitur *Auto TTH* berhasil diaktifkan.\n\nBot akan otomatis merespons link TikTok di chat ini.')
  }

  /* AUTO OFF */
  if (action === 'off') {
    chat.tthAuto = false
    return m.reply('❌ Fitur *Auto TTH* dimatikan.')
  }

  /* ADD HASHTAG */
  if (action === 'add') {
    const newTags = extractHashtags(text)
    if (!newTags.length) return m.reply(`⚠️ Format salah.\n\nKetik:\n*${prefix}${cmd} add #hashtag*`)
    
    chat.tthTags = [...new Set([...chat.tthTags, ...newTags])]
    return m.reply('✅ Hashtag berhasil ditambahkan!\n\n📋 Target saat ini:\n' + chat.tthTags.join(' '))
  }

  /* DELETE HASHTAG */
  if (action === 'del' || action === 'remove') {
    const delTags = extractHashtags(text)
    if (!delTags.length) return m.reply(`⚠️ Format salah.\n\nKetik:\n*${prefix}${cmd} del #hashtag*`)
    
    chat.tthTags = chat.tthTags.filter(tag => !delTags.includes(tag))
    return m.reply('✅ Hashtag berhasil dihapus!\n\n📋 Target saat ini:\n' + (chat.tthTags.length ? chat.tthTags.join(' ') : '(Kosong)'))
  }
  
  /* SET CN KEYWORD */
  if (action === 'setcn') {
    const kw = args.slice(1).join(' ')
    if (!kw) return m.reply(`⚠️ Format salah.\n\nKetik:\n*${prefix}${cmd} setcn ft AP|CN Lainnya*`)
    
    chat.cnKeywords = kw.split('|').map(k => k.trim()).filter(Boolean)
    return m.reply(`✅ CN Keyword berhasil diatur:\n${chat.cnKeywords.join(', ')}`)
  }

  /* LIST CONFIG */
  if (action === 'list') {
    return m.reply(`📋 *Konfigurasi TTH Chat Ini*\n\nStatus Auto: ${chat.tthAuto ? '✅ ON' : '❌ OFF'}\nTarget Hashtag: ${chat.tthTags.length ? chat.tthTags.join(' ') : '(Kosong)'}\nTarget CN Keyword: ${chat.cnKeywords.length ? chat.cnKeywords.join(', ') : '(Kosong)'}`)
  }

  /* CARI LINK */
  const quotedText = (m?.quoted && (m.quoted.text || m.quoted.caption)) || m?.quoted?.quoted?.text || ''
  const input = findUrlInText(text, m?.text, quotedText)

  if (!input) {
    return m.reply(
      `Kirim link TikTok atau gunakan konfigurasi.\n\n*Menu Konfigurasi:*\n- ${prefix}${cmd} on\n- ${prefix}${cmd} off\n- ${prefix}${cmd} add #hashtag\n- ${prefix}${cmd} del #hashtag\n- ${prefix}${cmd} setcn keyword1|keyword2\n- ${prefix}${cmd} list\n\n*Manual:*\n${prefix}${cmd} <link_tiktok>`
    )
  }

  return executeTth(m, input, conn, chat)
}

/* ============================ AUTO DETECT ============================ */

handler.before = async function (m, { conn }) {
  if (m.isBaileys || !m.text) return
  
  const chat = global.db.data?.chats?.[m.chat] || {}
  if (!chat.tthAuto) return

  /* Jangan proses command .tth untuk auto detect */
  if (m.text.startsWith('.') || m.text.startsWith('!')) {
    const cmd = m.text.slice(1).split(' ')[0].toLowerCase()
    if (['tth'].includes(cmd)) return
  }

  const input = findUrlInText(m.text)
  if (!input) return

  const check = validateTiktokUrl(input)
  if (!check.ok) return

  /* Pastikan config inisialisasi */
  if (!chat.tthTags) chat.tthTags = []
  if (!chat.cnKeywords) chat.cnKeywords = []

  return executeTth(m, input, conn, chat)
}

/* ============================ PLUGIN CONFIG ============================ */

handler.help = ['tth <url>', 'tth on', 'tth off', 'tth add #hashtag', 'tth del #hashtag', 'tth setcn <keyword>', 'tth list']
handler.tags = ['tools']
handler.command = ['tth']
handler.admin = true
handler.private = false
handler.register = false

export default handler