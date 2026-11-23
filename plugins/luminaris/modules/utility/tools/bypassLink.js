import { CHAT } from '../../../_runtime/core-shim.js'

const CORS_PROXY = "https://cors.rifkyshre.biz.id/"
const ENDPOINT = "https://trw.lat/api/bypass"
const API_KEY = "TRW_FREE-GAY-15a92945-9b04-4c75-8337-f2a6007281e9"

function parseResult(result) {
  if (typeof result !== "string") return String(result)
  const tuple = result.match(/^\(['"](.+?)['"],\s*(True|False)\)$/)
  if (tuple) return tuple[1]
  const quoted = result.match(/^["'](.+?)["']$/)
  if (quoted) return quoted[1]
  return result
}

function isValidUrl(s) {
  try {
    new URL(s)
    return true
  } catch {
    return false
  }
}

async function bypassUnlock(url) {
  const target = `${ENDPOINT}?apikey=${encodeURIComponent(API_KEY)}&url=${encodeURIComponent(url)}`
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 90000) // 90s timeout

  try {
    const res = await fetch(`${CORS_PROXY}${target}`, {
      headers: {
        Accept: "application/json",
        Origin: "https://code.rifkyshre.biz.id",
        Referer: "https://code.rifkyshre.biz.id/"
      },
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      return { ok: false, code: res.status, error: `HTTP ${res.status}` }
    }

    const body = await res.json()

    if (!body || typeof body !== "object") {
      return { ok: false, code: res.status, error: "Unexpected response format" }
    }

    if (!body.success) {
      return { ok: false, code: res.status, error: body.message || body.result || "Bypass failed (unsupported URL or backend error)" }
    }

    const clean = parseResult(body.result)
    return {
      ok: true,
      code: res.status,
      result: {
        originalUrl: url,
        bypassedUrl: clean,
        isValidUrl: isValidUrl(clean)
      }
    }
  } catch (e) {
    clearTimeout(timeoutId)
    return { 
      ok: false, 
      code: 500, 
      error: e.name === 'AbortError' ? 'Request timeout (took too long)' : e.message 
    }
  }
}

export default {
  name: 'bypass',
  command: ['bypass', 'unlock', 'byp'],
  event: [],
  allow: CHAT.BOTH,
  roleRequired: 10,
  category: 'tools',
  description: 'Bypass link shorteners and lockers (Linkvertise, Sub2unlock, etc.)',

  async handle(ctx) {
    const { sock, msg, args, chat } = ctx
    const url = args[0]

    if (!url || !isValidUrl(url)) {
      return sock.sendMessage(chat, { 
        text: '❌ Please provide a valid URL to bypass.\nExample: !bypass https://linkvertise.com/...' 
      }, { quoted: msg })
    }

    await sock.sendMessage(chat, { react: { text: '🔓', key: msg.key } })

    try {
      const result = await bypassUnlock(url)

      if (!result.ok) {
        await sock.sendMessage(chat, { 
          text: `❌ Failed to bypass link.\nError: ${result.error}` 
        }, { quoted: msg })
        await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
        return
      }

      const r = result.result
      const message = `✅ *Link Bypassed Successfully!*\n\n` +
                      `*Original:* ${r.originalUrl}\n` +
                      `*Result:* ${r.bypassedUrl}\n` +
                      `*Valid:* ${r.isValidUrl ? 'Yes' : 'No'}`

      await sock.sendMessage(chat, { text: message }, { quoted: msg })
      await sock.sendMessage(chat, { react: { text: '✅', key: msg.key } })

    } catch (error) {
      console.error('[Bypass Error]', error)
      await sock.sendMessage(chat, { 
        text: '❌ An unexpected error occurred while bypassing the link.' 
      }, { quoted: msg })
      await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
    }
  }
}