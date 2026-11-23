import { CHAT } from '../../../_runtime/core-shim.js'
import { logger } from '../../../_runtime/core-shim.js'

const BASE = "https://deepdreamgenerator.com"
const GENERATE_PAGE = `${BASE}/generate`
const GENERATE_API = `${BASE}/image-generator/generate`
const DOWNLOAD_API = `${BASE}/image-generator/download`

const MODELS = {
  "z turbo": { id: "250", name: "Z-Image Turbo" },
  "davinci": { id: "105", name: "DaVinci2" }
}

const UA = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36"
const MAX_POLL = 60
const POLL_DELAY_MS = 3000

async function getCsrfToken() {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

  try {
    const res = await fetch(GENERATE_PAGE, {
      headers: {
        "user-agent": UA,
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
      },
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    const html = await res.text()
    // Regex replacement for cheerio: find <meta name="csrf-token" content="...">
    const match = html.match(/<meta\s+name="csrf-token"\s+content="([^"]+)"/i)
    return match ? match[1] : null
  } catch (e) {
    clearTimeout(timeoutId)
    return null
  }
}

async function generateJob(csrf, prompt, modelKey) {
  const model = MODELS[modelKey] || MODELS["davinci"]
  const body = new URLSearchParams({
    textPrompt: prompt,
    textPromptNegative: "",
    visualTextPrompt: "",
    effectStrength: "60",
    baseResolution: "20",
    aiModel: model.id,
    deepStyle: "10",
    style_id: "3",
    aspectRatio: "10"
  })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  try {
    const res = await fetch(GENERATE_API, {
      method: "POST",
      headers: {
        "x-csrf-token": csrf,
        "x-requested-with": "XMLHttpRequest",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "accept": "application/json, text/javascript, */*; q=0.01",
        "origin": BASE,
        "referer": GENERATE_PAGE,
        "user-agent": UA
      },
      body: body.toString(),
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (res.status !== 200) throw new Error(`HTTP ${res.status}`)

    const json = await res.json()
    if (json?.error) throw new Error(json.error)

    // Regex replacement for cheerio: extract data attributes from the returned HTML snippet
    const html = json?.html || ""
    const idMatch = html.match(/data-id="([^"]+)"/)
    const tokenMatch = html.match(/data-anonym-user-token="([^"]+)"/)

    return {
      ok: true,
      jobId: idMatch ? idMatch[1] : null,
      anonymUserToken: tokenMatch ? tokenMatch[1] : "",
      modelName: model.name
    }
  } catch (e) {
    clearTimeout(timeoutId)
    throw e
  }
}

async function pollDownload(jobId, anonymUserToken) {
  for (let i = 0; i < MAX_POLL; i++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    try {
      const params = new URLSearchParams({ job_id: String(jobId) })
      if (anonymUserToken) params.set("ut", anonymUserToken)

      const res = await fetch(`${DOWNLOAD_API}?${params.toString()}`, {
        headers: {
          "accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
          "referer": GENERATE_PAGE,
          "user-agent": UA
        },
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      const contentType = res.headers.get("content-type") || ""

      if (res.status === 200 && contentType.includes("image/")) {
        const arrayBuffer = await res.arrayBuffer()
        return { ok: true, buffer: Buffer.from(arrayBuffer) }
      }

      // Not ready yet, wait and retry
      await new Promise(resolve => setTimeout(resolve, POLL_DELAY_MS))
    } catch (e) {
      clearTimeout(timeoutId)
      // If it's a timeout, just continue polling. If it's a real error, throw.
      if (e.name !== 'AbortError') throw e
      await new Promise(resolve => setTimeout(resolve, POLL_DELAY_MS))
    }
  }
  
  throw new Error("Generation timed out (took longer than 3 minutes)")
}

export default {
  name: 'deepdream',
  command: ['ai', 'deepdream', 'ddg', 'generate'],
  event: [],
  allow: CHAT.BOTH,
  roleRequired: 10,
  isPremium: true, // Great feature to gate for premium users!
  category: 'ai',
  description: 'Generate AI images using DeepDream Generator (DaVinci2 or Z-Turbo)',

  async handle(ctx) {
    const { sock, msg, args, chat, isPremium, isOwner } = ctx

    if (!isPremium && !isOwner) {
      return sock.sendMessage(chat, { 
        text: '❌ This is a premium-only AI feature. Ask the owner to upgrade you with `!premium on`' 
      }, { quoted: msg })
    }

    const prompt = args.join(' ').trim()
    if (!prompt || prompt.length < 3) {
      return sock.sendMessage(chat, { 
        text: '❌ Please provide a description for the image (min 3 characters).\nExample: !ai A futuristic cyberpunk city at night' 
      }, { quoted: msg })
    }

    await sock.sendMessage(chat, { react: { text: '🎨', key: msg.key } })

    try {
      // 1. Get CSRF Token
      const csrf = await getCsrfToken()
      if (!csrf) throw new Error("Failed to initialize session (CSRF token not found)")

      // 2. Start Generation Job
      await sock.sendMessage(chat, { text: '⏳ *Generating image...* This may take 30-60 seconds.' }, { quoted: msg })
      
      // Default to davinci, but allow user to specify 'z turbo' as first word if they know how
      let modelKey = "davinci"
      let finalPrompt = prompt
      if (prompt.toLowerCase().startsWith("z turbo ")) {
        modelKey = "z turbo"
        finalPrompt = prompt.slice(8).trim()
      }

      const job = await generateJob(csrf, finalPrompt, modelKey)
      if (!job.jobId) throw new Error("Job ID not returned by API")

      // 3. Poll for Result
      const result = await pollDownload(job.jobId, job.anonymUserToken)

      // 4. Send Image (RAW Baileys)
      await sock.sendMessage(chat, {
        image: result.buffer,
        mimetype: 'image/jpeg',
        caption: `*AI Generated*\n\n**Prompt:** ${finalPrompt}\n**Model:** ${job.modelName}`,
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true
        }
      }, { quoted: msg })

      await sock.sendMessage(chat, { react: { text: '✅', key: msg.key } })

    } catch (error) {
      logger.error('deepdream error', error)
      await sock.sendMessage(chat, { 
        text: `❌ Failed to generate image: ${error.message}` 
      }, { quoted: msg })
      await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
    }
  }
}