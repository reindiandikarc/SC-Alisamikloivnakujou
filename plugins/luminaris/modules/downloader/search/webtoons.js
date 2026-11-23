import { CHAT } from '../../../_runtime/core-shim.js'
import { logger } from '../../../_runtime/core-shim.js'

const WEBTOONS_BASE = "https://www.webtoons.com"

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "id-ID,id;q=0.9,en;q=0.8"
    }
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.text()
}

function extractSearchResults(html, query, limit) {
  const items = []
  const cardRegex = /<a\s+class="link\s+_card_item"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi
  let match
  
  while ((match = cardRegex.exec(html)) !== null) {
    if (items.length >= limit) break
    
    const href = match[1]
    const content = match[2]
    
    const titleNoMatch = href.match(/title_no=(\d+)/)
    if (!titleNoMatch) continue
    const titleNo = Number(titleNoMatch[1])
    
    const titleMatch = content.match(/<strong\s+class="title"[^>]*>(.*?)<\/strong>/i) || 
                       content.match(/title="([^"]+)"/i)
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : 'Unknown'
    
    const authorMatch = content.match(/class="author"[^>]*>(.*?)</i)
    const author = authorMatch ? authorMatch[1].replace(/<[^>]+>/g, '').trim() : null
    
    const thumbMatch = content.match(/<img[^>]+src="(https:\/\/webtoon-phinf\.pstatic\.net\/[^"]+)"/i)
    const thumbnail = thumbMatch ? thumbMatch[1] : null
    
    const isCanvas = href.includes('/canvas/')
    const genreMatch = href.match(/\/id\/([^/]+)\/[^/]+\/list/)
    const genre = !isCanvas && genreMatch ? genreMatch[1] : null
    
    const absUrl = href.startsWith('http') ? href : `${WEBTOONS_BASE}${href}`
    
    items.push({
      titleNo, title, author, thumbnail, genre,
      section: isCanvas ? "canvas" : "originals",
      url: absUrl.split('&webtoon-platform-redirect')[0]
    })
  }

  const seen = new Set()
  const unique = items.filter(it => {
    const key = `${it.section}:${it.titleNo}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return {
    query,
    count: unique.length,
    originals: unique.filter(i => i.section === "originals"),
    canvas: unique.filter(i => i.section === "canvas"),
    items: unique
  }
}

function extractDetail(html, url) {
  const titleNoMatch = url.match(/title_no=(\d+)/)
  const titleNo = titleNoMatch ? Number(titleNoMatch[1]) : null
  
  const titleMatch = html.match(/<h1\s+class="subj"[^>]*>(.*?)<\/h1>/i) || 
                     html.match(/<meta\s+property="og:title"\s+content="(.*?)"/i)
  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : null

  const authorMatch = html.match(/class="author"[^>]*>(.*?)</i)
  const author = authorMatch ? authorMatch[1].replace(/<[^>]+>/g, '').trim() : null

  const synopsisMatch = html.match(/<p\s+class="summary"[^>]*>([\s\S]*?)<\/p>/i) ||
                        html.match(/<meta\s+property="og:description"\s+content="(.*?)"/i)
  const synopsis = synopsisMatch ? synopsisMatch[1].replace(/<[^>]+>/g, '').trim() : null

  const genreMatch = html.match(/<h2\s+class="genre"[^>]*>(.*?)<\/h2>/i)
  const genre = genreMatch ? genreMatch[1].replace(/<[^>]+>/g, '').trim() : null

  const dayMatch = html.match(/<p\s+class="day_info"[^>]*>(.*?)<\/p>/i)
  const day = dayMatch ? dayMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : null

  const status = /completed|tamat|selesai/i.test(day || '') ? "COMPLETED" : 
                 /(every|setiap|UP)/i.test(day || '') ? "ONGOING" : null

  const ratingMatch = html.match(/<em\s+id="_starScoreAverage"[^>]*>(.*?)<\/em>/i) ||
                      html.match(/<span\s+class="grade_num"[^>]*>(.*?)<\/span>/i)
  const rating = ratingMatch ? parseFloat(ratingMatch[1].replace(/<[^>]+>/g, '').trim()) || null : null

  const thumbMatch = html.match(/<meta\s+property="og:image"\s+content="(.*?)"/i)
  const thumbnail = thumbMatch ? thumbMatch[1].replace(/&amp;/g, '&') : null

  return {
    titleNo, title, author, synopsis, genre, day, status, rating, thumbnail,
    url: url.split('&webtoon-platform-redirect')[0]
  }
}

export default {
  name: 'webtoons',
  command: ['webtoon', 'webtoons', 'wt'],
  event: [],
  allow: CHAT.BOTH,
  roleRequired: 10,
  category: 'search',
  description: 'Search Webtoons or get details from a Webtoons URL',

  async handle(ctx) {
    const { sock, msg, args, chat } = ctx
    const input = args.join(' ').trim()

    if (!input) {
      return sock.sendMessage(chat, { 
        text: '*Webtoons Search*\n\n' +
              '*Usage:*\n' +
              '!webtoon <title> (Search by name)\n' +
              '!webtoon <url> (Get details from URL)\n\n' +
              '*Example:*\n' +
              '!webtoon tower of god\n' +
              '!webtoon https://www.webtoons.com/id/fantasy/tower-of-god/list?title_no=749'
      }, { quoted: msg })
    }

    await sock.sendMessage(chat, { react: { text: '📖', key: msg.key } })

    try {
      if (input.startsWith('http')) {
        const html = await fetchHtml(input)
        const detail = extractDetail(html, input)
        
        let message = `*${detail.title || 'Webtoon'}*\n\n`
        if (detail.author) message += `*Author:* ${detail.author}\n`
        if (detail.genre) message += `*Genre:* ${detail.genre}\n`
        if (detail.status) message += `*Status:* ${detail.status}\n`
        if (detail.day) message += `*Schedule:* ${detail.day}\n`
        if (detail.rating) message += `*Rating:* ${detail.rating}\n`
        message += `\n*Synopsis:*\n${detail.synopsis || 'No synopsis available.'}\n\n`
        message += `${detail.url}`

        await sock.sendMessage(chat, { text: message }, { quoted: msg })
      } else {
        const searchUrl = `${WEBTOONS_BASE}/id/search?keyword=${encodeURIComponent(input)}`
        const html = await fetchHtml(searchUrl)
        const result = extractSearchResults(html, input, 10)

        if (result.count === 0) {
          await sock.sendMessage(chat, { text: `❌ No results found for "${input}".` }, { quoted: msg })
          await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
          return
        }

        let message = `*Search Results for "${input}"*\n`
        message += `Found ${result.count} webtoons (${result.originals.length} Originals, ${result.canvas.length} Canvas)\n\n`

        for (const w of result.originals.slice(0, 5)) {
          message += `*${w.title}*\n`
          if (w.author) message += `${w.author}\n`
          if (w.genre) message += `${w.genre}\n`
          message += `${w.url}\n\n`
        }

        if (result.canvas.length > 0) {
          message += `*Canvas (Top 3):*\n`
          for (const w of result.canvas.slice(0, 3)) {
            message += `• *${w.title}*\n  ${w.url}\n`
          }
        }

        await sock.sendMessage(chat, { text: message }, { quoted: msg })
      }

      await sock.sendMessage(chat, { react: { text: '✅', key: msg.key } })

    } catch (error) {
      logger.error('webtoons error', error)
      await sock.sendMessage(chat, { text: `❌ Failed to fetch Webtoons data: ${error.message}` }, { quoted: msg })
      await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
    }
  }
}