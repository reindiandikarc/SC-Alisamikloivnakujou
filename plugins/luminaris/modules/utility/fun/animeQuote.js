import { CHAT } from '../../../_runtime/core-shim.js'

const API = "https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/anime-quotes.json"

async function getQuotes() {
  const res = await fetch(API, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/json,text/plain,*/*"
    }
  })

  const text = await res.text()

  if (!res.ok) {
    return { ok: false, code: res.status, data: null, error: text }
  }

  try {
    return { ok: true, code: res.status, data: JSON.parse(text), error: null }
  } catch {
    return { ok: false, code: res.status, data: null, error: "Invalid JSON" }
  }
}

function normalizeQuotes(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data.quotes)) return data.quotes
  if (Array.isArray(data.result)) return data.result
  if (Array.isArray(data.data)) return data.data
  return []
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

export default {
  name: 'animequote',
  command: ['animequote', 'quote', 'aq'],
  event: [],
  allow: CHAT.BOTH,
  roleRequired: 10,
  category: 'fun',
  description: 'Get a random anime quote',

  async handle(ctx) {
    const { sock, msg, chat } = ctx

    try {
      // 1. Initial React
      await sock.sendMessage(chat, { react: { text: '📜', key: msg.key } })

      // 2. Fetch Data
      const result = await getQuotes()

      if (!result.ok) {
        await sock.sendMessage(chat, { 
          text: `❌ Failed to fetch quotes. API Error: ${result.code}` 
        }, { quoted: msg })
        await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
        return
      }

      // 3. Normalize & Pick Random
      const quotes = normalizeQuotes(result.data)
      const selected = pickRandom(quotes)

      if (!selected) {
        await sock.sendMessage(chat, { 
          text: '❌ No quotes found in the database.' 
        }, { quoted: msg })
        await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
        return
      }

      // 4. Fallback properties based on common JSON structures
      const quoteText = selected.quote || selected.text || selected.kata || 'Unknown quote'
      const character = selected.character || selected.char || selected.name || selected.tokoh || 'Unknown character'
      const anime = selected.anime || selected.title || selected.source || 'Unknown anime'

      // 5. Format & Send Message (RAW Baileys)
      const message = `*Random Anime Quote*\n\n` +
                      `"${quoteText}"\n\n` +
                      `— *${character}*\n` +
                      `*${anime}*`

      await sock.sendMessage(chat, { text: message }, { quoted: msg })
      
      // 6. Success React
      await sock.sendMessage(chat, { react: { text: '✅', key: msg.key } })

    } catch (error) {
      console.error('[AnimeQuote Error]', error)
      await sock.sendMessage(chat, { 
        text: '❌ An unexpected error occurred while fetching the quote.' 
      }, { quoted: msg })
      await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
    }
  }
}