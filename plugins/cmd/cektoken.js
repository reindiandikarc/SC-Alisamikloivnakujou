// Plugin: cektoken
// Commands: cektoken, tokencount, hitungtoken
// Hitung token dari teks input untuk berbagai provider AI
// Engine: GPTforWork API (gptforwork.com) — no API key needed

'use strict'

const https = require('https')
const { URL } = require('url')

// ─── GPTforWork client ────────────────────────────────────────────────────
const UA_LIST = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
]

function spoofIP () {
  const ranges = [
    1, 2, 5, 23, 27, 31, 36, 37, 39, 42,
    46, 49, 50, 60, 114, 117, 118, 119, 120,
    121, 122, 123, 124, 125, 126, 180, 182, 183
  ]
  const first = ranges[Math.floor(Math.random() * ranges.length)]
  return [first, ...Array.from({ length: 3 }, () => Math.floor(Math.random() * 256))].join('.')
}

function countTokens (input, provider, model) {
  return new Promise((resolve, reject) => {
    const targetUrl = new URL(`https://gptforwork.com/api/tokens/${provider}`)
    const body      = JSON.stringify({ model, message: input })
    const ip        = spoofIP()

    const req = https.request({
      hostname          : targetUrl.hostname,
      path              : targetUrl.pathname,
      method            : 'POST',
      rejectUnauthorized: false,
      headers: {
        'User-Agent'        : UA_LIST[Math.floor(Math.random() * UA_LIST.length)],
        'Accept'            : 'application/json',
        'Content-Type'      : 'application/json',
        'Content-Length'    : Buffer.byteLength(body),
        'X-Forwarded-For'   : ip,
        'X-Real-IP'         : ip,
        'Client-IP'         : ip,
        'True-Client-IP'    : ip,
        'X-Originating-IP'  : ip,
        'X-Cluster-Client-IP': ip,
        'Forwarded'         : `for=${ip}`
      }
    }, (res) => {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf-8')))
        } catch (e) {
          reject(new Error('Gagal parse response'))
        }
      })
    })

    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

// ─── Provider & model map ──────────────────────────────────────────────────
// Format command: .cektoken <provider> <model> <teks>
// Provider: anthropic, gemini, xai
const PROVIDER_INFO = {
  anthropic: {
    label : 'Anthropic',
    emoji : '🧡',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307', 'claude-sonnet-4-6']
  },
  gemini: {
    label : 'Google Gemini',
    emoji : '💙',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash']
  },
  xai: {
    label : 'xAI Grok',
    emoji : '🖤',
    models: ['grok-beta', 'grok-2-1212']
  }
}

const DEFAULT_MODEL = {
  anthropic: 'claude-sonnet-4-6',
  gemini   : 'gemini-1.5-flash',
  xai      : 'grok-beta'
}

// ─── Plugin handler ───────────────────────────────────────────────────────
module.exports = {
  command: ['cektoken', 'tokencount', 'hitungtoken'],
  tags: ['tools'],
  run: async (alya, m, ctx) => {
    const { args, prefix, command, replyalya } = ctx

    // Usage: .cektoken <provider> [model] <teks...>
    // Shorthand: .cektoken <teks> → default ke anthropic + claude-sonnet-4-6
    if (!args.length) {
      const modelList = Object.entries(PROVIDER_INFO)
        .map(([p, v]) => `${v.emoji} *${p}*: ${v.models.join(', ')}`)
        .join('\n')

      return replyalya(
        `╭━━━〔 🔢 *TOKEN COUNTER* 〕━━━⬣\n` +
        `┃\n` +
        `┃ Hitung estimasi token dari teks.\n` +
        `┃\n` +
        `┃ *Format:*\n` +
        `┃ ${prefix + command} <provider> <model> <teks>\n` +
        `┃ ${prefix + command} <teks>  ← default anthropic\n` +
        `┃\n` +
        `┃ *Provider tersedia:*\n` +
        `┃ anthropic | gemini | xai\n` +
        `┃\n` +
        `┃ *Contoh:*\n` +
        `┃ ${prefix + command} Halo dunia ini teks test\n` +
        `┃ ${prefix + command} gemini gemini-1.5-pro Teks panjang...\n` +
        `┗━━━━━━━━━━━━━━━━━━━━━━━━━⬣`
      )
    }

    // Parse args: cek apakah arg[0] adalah provider valid
    let provider = 'anthropic'
    let model    = DEFAULT_MODEL.anthropic
    let inputText

    if (PROVIDER_INFO[args[0]?.toLowerCase()]) {
      provider = args[0].toLowerCase()
      model    = DEFAULT_MODEL[provider]

      // Cek apakah arg[1] adalah model dari provider ini
      if (args[1] && PROVIDER_INFO[provider].models.includes(args[1])) {
        model     = args[1]
        inputText = args.slice(2).join(' ')
      } else {
        inputText = args.slice(1).join(' ')
      }
    } else {
      // Semua args dianggap teks, gunakan default anthropic
      inputText = args.join(' ')
    }

    if (!inputText?.trim()) {
      return replyalya(`❌ Teks tidak boleh kosong.\n\nFormat: ${prefix + command} <teks>`)
    }

    await alya.sendMessage(m.chat, { react: { text: '🔢', key: m.key } })

    try {
      const result = await countTokens(inputText.trim(), provider, model)

      // Biasanya response: { tokens: N } atau { count: N } tergantung provider
      const tokenCount = result?.tokens ?? result?.count ?? result?.token_count ?? null

      const pInfo     = PROVIDER_INFO[provider]
      const charCount = inputText.trim().length
      const wordCount = inputText.trim().split(/\s+/).length

      let caption =
        `🔢 *TOKEN COUNTER RESULT*\n\n` +
        `${pInfo.emoji} *Provider :* ${pInfo.label}\n` +
        `🤖 *Model    :* ${model}\n\n` +
        `━━━━━━━━━━━━━━━\n` +
        `📊 *Token    :* ${tokenCount !== null ? tokenCount : 'N/A'}\n` +
        `🔤 *Karakter :* ${charCount}\n` +
        `📝 *Kata     :* ${wordCount}\n` +
        `━━━━━━━━━━━━━━━\n\n` +
        `📄 *Teks:*\n_${inputText.trim().substring(0, 200)}${inputText.length > 200 ? '...' : ''}_`

      if (tokenCount === null) {
        caption += `\n\n⚠️ _Tidak dapat membaca jumlah token dari response API._`
      }

      await m.reply(caption)
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (e) {
      console.error('[cektoken]', e.message)
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      m.reply(`❌ *Token Counter Error:* ${e.message}`)
    }
  }
}
