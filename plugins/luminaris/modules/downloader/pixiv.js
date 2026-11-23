import { CHAT, logger } from '../../_runtime/core-shim.js'

const BASE = 'https://www.pixiv.net'
const UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36'
const MAX_IMAGES = 4
const MAX_IMAGE_BYTES = 15 * 1024 * 1024

let cookieJar = ''

function rememberCookies(res) {
  const list = typeof res.headers.getSetCookie === 'function'
    ? res.headers.getSetCookie()
    : String(res.headers.get('set-cookie') || '').split(/,(?=[^;,]+=)/)
  const cookies = list.map((item) => String(item).split(';')[0]).filter(Boolean)
  if (cookies.length) cookieJar = cookies.join('; ')
}

async function pixivFetch(path, headers = {}, timeout = 45_000) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'user-agent': UA,
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      ...(cookieJar ? { cookie: cookieJar } : {}),
      ...headers
    },
    signal: AbortSignal.timeout(timeout)
  })
  rememberCookies(res)
  return res
}

function decodeText(text) {
  return String(text || '')
    .replace(/\\\//g, '/')
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
}

function cleanText(text) {
  return decodeText(text)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

export function normalizeTags(tags) {
  if (!Array.isArray(tags)) return []
  return tags.map((tag) => {
    if (typeof tag === 'string') return tag
    return tag?.translation?.en || tag?.translation || tag?.tag_translation || tag?.tag || tag?.name || tag?.romaji || null
  }).filter(Boolean)
}

function normalizeImage(url) {
  return url ? String(url).replace(/\\\//g, '/') : null
}

export function parseSearchResponse(json) {
  const items = json?.body?.illustManga?.data
  if (!Array.isArray(items)) return []
  return items.filter((item) => item?.id && item.illustType !== 2)
}

export function imageUrlsFromArtwork(detail, pages = []) {
  const fromPages = pages
    .map((page) => normalizeImage(page?.urls?.original || page?.urls?.regular))
    .filter(Boolean)
  if (fromPages.length) {
    return fromPages.map((url) => (url.endsWith('.zip') ? null : url)).filter(Boolean)
  }

  const fallback = normalizeImage(detail?.urls?.original || detail?.urls?.regular)
  return fallback && !fallback.endsWith('.zip') ? [fallback] : []
}

export function buildCaption(detail, item, shown, total) {
  const tags = normalizeTags(detail?.tags?.tags || detail?.tags).slice(0, 12)
  const description = cleanText(detail?.description || item?.description || '')

  const lines = [
    '🎨 *PIXIV ARTWORK*',
    '',
    '╭──〔 📋 *INFORMASI* 〕──⬣',
    `│ 🖼️ Judul: ${detail?.title || item?.title || 'Tanpa judul'}`,
    `│ 👤 Artist: ${detail?.userName || item?.userName || 'Tidak diketahui'}`,
    `│ 🆔 ID: ${item?.id || '-'}`
  ]

  if (detail?.likeCount) lines.push(`│ ❤️ Likes: ${Number(detail.likeCount).toLocaleString('id-ID')}`)
  if (detail?.viewCount) lines.push(`│ 👁️ Views: ${Number(detail.viewCount).toLocaleString('id-ID')}`)
  if (detail?.bookmarkCount) lines.push(`│ 🔖 Bookmarks: ${Number(detail.bookmarkCount).toLocaleString('id-ID')}`)
  if (tags.length) lines.push(`│ 🏷️ Tags: ${tags.join(', ')}`)
  lines.push('╰───────────────⬣')

  if (description) {
    lines.push('', `📝 ${description.slice(0, 220)}${description.length > 220 ? '…' : ''}`)
  }

  if (total > 1) lines.push('', `🖼️ Menampilkan ${shown} dari ${total} gambar.`)
  lines.push('', `🔗 ${BASE}/en/artworks/${item?.id || ''}`)
  return lines.join('\n')
}

function imageMime(url) {
  const pathname = String(url).split('?')[0].toLowerCase()
  if (pathname.endsWith('.png')) return 'image/png'
  if (pathname.endsWith('.gif')) return 'image/gif'
  if (pathname.endsWith('.webp')) return 'image/webp'
  return 'image/jpeg'
}

async function downloadImage(url) {
  const res = await fetch(url, {
    headers: {
      'user-agent': UA,
      referer: `${BASE}/`,
      accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      ...(cookieJar ? { cookie: cookieJar } : {})
    },
    signal: AbortSignal.timeout(60_000)
  })

  if (!res.ok) throw new Error(`Gambar gagal diunduh (HTTP ${res.status}).`)
  const buffer = Buffer.from(await res.arrayBuffer())
  if (buffer.length > MAX_IMAGE_BYTES) throw new Error('Ukuran gambar terlalu besar untuk WhatsApp.')
  return buffer
}

function helpText(prefix) {
  return [
    '🎨 *PIXIV DOWNLOADER*',
    'Cari artwork lalu kirim gambar dari Pixiv.',
    '',
    '*Cara pakai*',
    `• ${prefix}pixiv <kata kunci>`,
    '',
    '*Contoh*',
    `> ${prefix}pixiv Hinata Hyuga`,
    `> ${prefix}pixiv Naruto`,
    '',
    `_Bot memilih artwork secara acak dari hasil pencarian dan mengirim maksimal ${MAX_IMAGES} gambar._`
  ].join('\n')
}

export default {
  name: 'pixiv',
  command: ['pixiv', 'pixivdl', 'pixivsearch', 'pixivart'],
  event: [],
  allow: CHAT.BOTH,
  roleRequired: 10,
  category: 'downloader',
  description: 'Cari dan unduh artwork dari Pixiv',

  async handle(ctx) {
    const prefix = ctx.prefix || '!'
    const query = (ctx.args || []).join(' ').trim()

    if (!query) return ctx.reply(helpText(prefix))

    if (!ctx.isOwner && !ctx.isPremium) {
      return ctx.reply([
        '💎 *FITUR PREMIUM*',
        '',
        '> Command Pixiv khusus untuk user Premium.',
        `> Ketik *${prefix}benefitpremium* untuk melihat cara upgrade.`
      ].join('\n'))
    }

    await ctx.reply.react('🔍')
    await ctx.reply(`⏳ *Mencari artwork "${query}" di Pixiv...*`)

    try {
      // Pemanasan cookie. Kalau halaman utama menolak, pencarian AJAX masih
      // sering bekerja, jadi kegagalan di sini tidak dianggap fatal.
      try {
        await pixivFetch('/?lang=en', {
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }, 20_000)
      } catch {}

      const page = Math.floor(Math.random() * 5) + 1
      const params = new URLSearchParams({
        word: query,
        order: 'date_d',
        mode: 'all',
        p: String(page),
        s_mode: 's_tag',
        type: 'all',
        lang: 'en'
      })

      const searchRes = await pixivFetch(`/ajax/search/artworks/${encodeURIComponent(query)}?${params}`, {
        accept: 'application/json',
        referer: `${BASE}/en/tags/${encodeURIComponent(query)}`,
        'x-requested-with': 'XMLHttpRequest'
      })

      if (!searchRes.ok) {
        throw new Error(`Pencarian Pixiv gagal (HTTP ${searchRes.status}).`)
      }

      const searchJson = await searchRes.json().catch(() => null)
      const items = parseSearchResponse(searchJson)
      if (!items.length) {
        await ctx.reply.react('❌')
        return ctx.reply(`❌ *Artwork tidak ditemukan untuk:* ${query}\n\n> Coba kata kunci lain.`)
      }

      const item = items[Math.floor(Math.random() * Math.min(items.length, 20))]

      const [detailRes, pagesRes] = await Promise.all([
        pixivFetch(`/ajax/illust/${item.id}`, {
          accept: 'application/json',
          referer: `${BASE}/en/artworks/${item.id}`,
          'x-requested-with': 'XMLHttpRequest'
        }),
        pixivFetch(`/ajax/illust/${item.id}/pages`, {
          accept: 'application/json',
          referer: `${BASE}/en/artworks/${item.id}`,
          'x-requested-with': 'XMLHttpRequest'
        })
      ])

      const detailJson = detailRes.ok ? await detailRes.json().catch(() => null) : null
      const pagesJson = pagesRes.ok ? await pagesRes.json().catch(() => null) : null
      const detail = detailJson?.body || null
      const pages = Array.isArray(pagesJson?.body) ? pagesJson.body : []
      const images = imageUrlsFromArtwork(detail, pages)

      if (!images.length) {
        await ctx.reply.react('❌')
        return ctx.reply([
          '❌ *Gambar tidak ditemukan.*',
          '',
          `> Artwork: ${detail?.title || item.title || 'Tanpa judul'}`,
          `> ${BASE}/en/artworks/${item.id}`
        ].join('\n'))
      }

      const targets = images.slice(0, MAX_IMAGES)
      let shown = 0
      let first = true

      for (const url of targets) {
        try {
          const buffer = await downloadImage(url)
          await ctx.sock.sendMessage(ctx.chat, {
            image: buffer,
            mimetype: imageMime(url),
            caption: first ? buildCaption(detail, item, targets.length, images.length) : undefined
          }, { quoted: ctx.msg })
          shown++
          first = false
        } catch (error) {
          logger.warn(`pixiv: gagal mengirim gambar (${error.message})`)
        }
      }

      if (!shown) {
        await ctx.reply.react('❌')
        return ctx.reply([
          '❌ *Gagal mengunduh gambar Pixiv.*',
          '',
          `> ${BASE}/en/artworks/${item.id}`,
          '',
          '> Coba lagi nanti.'
        ].join('\n'))
      }

      await ctx.reply.react('✅')
      if (images.length > shown) {
        await ctx.reply(`🖼️ *${shown} dari ${images.length} gambar dikirim.*\n\n> Ketik *${prefix}pixiv ${query}* lagi untuk artwork lain.`)
      }
    } catch (error) {
      logger.error('pixiv: pencarian/unduh gagal', error)
      await ctx.reply.react('❌')
      await ctx.reply([
        '❌ *Gagal mengambil artwork Pixiv.*',
        '',
        `> ${error.message}`,
        '',
        '> Coba lagi nanti atau gunakan kata kunci lain.'
      ].join('\n'))
    }
  }
}

export const __test = {
  normalizeTags,
  parseSearchResponse,
  imageUrlsFromArtwork,
  buildCaption,
  cleanText
}
