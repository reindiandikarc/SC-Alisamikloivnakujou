import { CHAT } from '../../../_runtime/core-shim.js'
import { logger } from '../../../_runtime/core-shim.js'

function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

async function shortenUrl(url, alias) {
  const payload = {
    long_url: url
  }
  
  if (alias) {
    payload.alias = alias
  }

  const res = await fetch('https://spoo.me/api/v1/shorten', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'origin': 'https://spoo.me',
      'referer': 'https://spoo.me/',
      'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
    },
    body: JSON.stringify(payload)
  })

  const data = await res.json()

  if (!res.ok || !data.short_url) {
    throw new Error(data.message || data.error || `Failed to shorten URL (HTTP ${res.status})`)
  }

  return {
    shortUrl: data.short_url,
    alias: data.alias,
    originalUrl: data.long_url,
    claimToken: data.claim_token || null
  }
}

export default {
  name: 'shorten',
  command: ['shorturl', 'spoome', 'url'],
  event: [],
  allow: CHAT.BOTH,
  roleRequired: 10,
  category: 'tools',
  description: 'Shorten long URLs using spoo.me (optional custom alias)',

  async handle(ctx) {
    const { sock, msg, args, chat } = ctx

    if (args.length === 0) {
      return sock.sendMessage(chat, { 
        text: '❌ Please provide a URL to shorten.\n\n*Usage:*\n!shorten <url>\n!shorten <url> <custom_alias>' 
      }, { quoted: msg })
    }

    const url = args[0]
    const alias = args[1] || null

    if (!isValidUrl(url)) {
      return sock.sendMessage(chat, { 
        text: '❌ Invalid URL format. Please include http:// or https://' 
      }, { quoted: msg })
    }

    await sock.sendMessage(chat, { react: { text: '🔗', key: msg.key } })

    try {
      const result = await shortenUrl(url, alias)

      const message = `✅ *URL Shortened Successfully!*\n\n` +
                      `*Short URL:* ${result.shortUrl}\n` +
                      `*Original:* ${result.originalUrl}\n` +
                      (result.alias ? `*Alias:* ${result.alias}\n` : '') +
                      (result.claimToken ? `\n*Claim Token:* \`${result.claimToken}\`\n_(Save this to manage/delete the link later)_` : '')

      await sock.sendMessage(chat, { text: message }, { quoted: msg })
      await sock.sendMessage(chat, { react: { text: '✅', key: msg.key } })

    } catch (error) {
      logger.error('shorten error', error)
      await sock.sendMessage(chat, { 
        text: `❌ Failed to shorten URL: ${error.message}` 
      }, { quoted: msg })
      await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
    }
  }
}