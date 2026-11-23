import { CHAT } from '../../../_runtime/core-shim.js'
import { logger } from '../../../_runtime/core-shim.js'

const API = "https://api.rifkyshre.biz.id"
const ROUTE = "/scrape/animexin"

async function fetchAnimexin(input) {
  try {
    const res = await fetch(`${API}${ROUTE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://code.rifkyshre.biz.id',
        'Referer': 'https://code.rifkyshre.biz.id/'
      },
      body: JSON.stringify(input)
    })

    const body = await res.json()
    if (!body?.status) {
      return { ok: false, error: body?.error || 'Unknown error', code: body?.code || res.status }
    }

    return { ok: true, data: body.data }
  } catch (e) {
    return { ok: false, error: e.message, code: 500 }
  }
}

export default {
  name: 'animexin',
  command: ['animexin', 'anime', 'ax'],
  event: [],
  allow: CHAT.BOTH,
  roleRequired: 10,
  category: 'tools',
  description: 'Search anime or get details/episodes from AnimeXin',

  async handle(ctx) {
    const { sock, msg, args, chat } = ctx
    const inputStr = args.join(' ').trim()

    if (!inputStr) {
      return sock.sendMessage(chat, { 
        text: '*AnimeXin Search*\n\n' +
              '*Usage:*\n' +
              '!animexin <title> (Search anime)\n' +
              '!animexin <url> (Get details & episodes)\n\n' +
              '*Example:*\n' +
              '!animexin renegade immortal\n' +
              '!animexin https://animexin.dev/renegade-immortal/'
      }, { quoted: msg })
    }

    await sock.sendMessage(chat, { react: { text: '🔍', key: msg.key } })

    try {
      const isUrl = inputStr.startsWith('http')
      const payload = isUrl ? { url: inputStr } : { query: inputStr }
      
      const result = await fetchAnimexin(payload)

      if (!result.ok) {
        await sock.sendMessage(chat, { text: `❌ Failed to fetch data: ${result.error}` }, { quoted: msg })
        await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
        return
      }

      const data = result.data

      if (data.mode === 'search') {
        if (!data.results || data.results.length === 0) {
          await sock.sendMessage(chat, { text: `❌ No results found for "${inputStr}".` }, { quoted: msg })
          await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
          return
        }

        let message = `*Search Results for "${inputStr}"*\n`
        message += `Found ${data.total || data.results.length} results.\n\n`

        for (const a of data.results.slice(0, 8)) {
          const badge = [a.type, a.status].filter(Boolean).join(' / ')
          message += `*${a.title}*${badge ? ` [${badge}]` : ''}\n`
          message += `   ${a.url}\n\n`
        }

        message += `_Tip: Use !animexin <url> to get detailed info and episode list._`
        await sock.sendMessage(chat, { text: message }, { quoted: msg })
      } 
      else if (data.mode === 'detail') {
        let message = `*${data.title}*\n\n`
        message += `*Status:* ${data.information?.status || '-'}\n`
        message += `*Type:* ${data.information?.type || '-'}\n`
        message += `*Country:* ${data.information?.country || '-'}\n`
        message += `*Studio:* ${data.information?.studio || '-'}\n`
        message += `*Released:* ${data.information?.released || '-'}\n`
        message += `*Rating:* ${data.rating || '-'}\n`
        message += `*Genres:* ${data.genres?.join(', ') || '-'}\n`
        message += `*Total Eps:* ${data.totalEpisode || '-'}\n\n`
        
        message += `*Synopsis:*\n${(data.synopsis || 'No synopsis available.').slice(0, 400)}${(data.synopsis?.length > 400) ? '...' : ''}\n\n`
        
        if (data.episodes && data.episodes.length > 0) {
          message += `*Latest 5 Episodes:*\n`
          for (const ep of data.episodes.slice(0, 5)) {
            message += `   Ep ${ep.episode || '?'} — ${ep.date || ''}\n`
            message += `      ${ep.url}\n`
          }
        }

        if (data.thumbnail) {
          await sock.sendMessage(chat, {
            image: { url: data.thumbnail },
            caption: message
          }, { quoted: msg })
        } else {
          await sock.sendMessage(chat, { text: message }, { quoted: msg })
        }
      }

      await sock.sendMessage(chat, { react: { text: '✅', key: msg.key } })

    } catch (error) {
      logger.error('animexin error', error)
      await sock.sendMessage(chat, { text: `❌ An unexpected error occurred: ${error.message}` }, { quoted: msg })
      await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
    }
  }
}