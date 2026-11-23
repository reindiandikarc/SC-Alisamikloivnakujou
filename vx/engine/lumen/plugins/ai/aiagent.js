/**
 * vanXone — AI AGENT
 * AI Rich + Persistent Memory + Multi-Provider Fallback
 *
 * AI Rich builder: @whiskeysockets/baileys
 * Creator: Hamm
 */

import fs from 'fs'
import path from 'path'
import { AIRich } from '@whiskeysockets/baileys'

const DATA_DIR = './data'
const MEMORY_FILE = path.join(DATA_DIR, 'ai-agent-memory.json')

// Direktori untuk menyimpan API Key
const LIB_DIR = './engine/lumen/lib'
const PROVIDERS_FILE = path.join(LIB_DIR, 'ai-providers.json')

const MAX_HISTORY = 20
const MAX_TOOL_STEPS = 4
const REQUEST_TIMEOUT = 90000

const SYSTEM_PROMPT = `
Kamu adalah vanXone, AI assistant dari vanXone yang dibuat oleh vanXone.
Kepribadianmu imut, santai, natural, ramah, sedikit manja, dan suka berkata
"waku waku" atau "ehehe" sesekali jika cocok.

Gunakan bahasa yang sama dengan pengguna, terutama bahasa Indonesia santai.
Jangan terlalu formal, jangan mengaku sebagai ChatGPT atau Gemini.
Jawab dengan jelas dan sesuai kebutuhan pengguna.
Kamu bisa menggunakan tools yang tersedia untuk menghitung dan mengelola catatan.
Jangan mengaku telah menyimpan catatan jika tool penyimpanan gagal.
Untuk kode, berikan kode yang relevan dan jangan mengarang hasil eksekusi.
`

const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'calculator',
      description: 'Menghitung ekspresi matematika sederhana.',
      parameters: {
        type: 'object',
        properties: {
          expression: {
            type: 'string',
            description: 'Ekspresi matematika, misalnya (25 * 4) / 2'
          }
        },
        required: ['expression'],
        additionalProperties: false
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'remember',
      description: 'Menyimpan catatan untuk percakapan ini.',
      parameters: {
        type: 'object',
        properties: {
          note: {
            type: 'string',
            description: 'Isi catatan yang ingin disimpan'
          }
        },
        required: ['note'],
        additionalProperties: false
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'memory_search',
      description: 'Mencari catatan yang pernah disimpan untuk percakapan ini.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Kata kunci yang ingin dicari'
          }
        },
        required: ['query'],
        additionalProperties: false
      }
    }
  }
]

function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  if (!fs.existsSync(MEMORY_FILE)) {
    fs.writeFileSync(MEMORY_FILE, '{}', 'utf8')
  }
}

// Fungsi untuk memastikan file config AI ada dengan setelan Groq & OpenRouter
function ensureProvidersConfig() {
  if (!fs.existsSync(LIB_DIR)) {
    fs.mkdirSync(LIB_DIR, { recursive: true })
  }

  if (!fs.existsSync(PROVIDERS_FILE)) {
    const defaultProviders = [
      {
        name: 'Groq',
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: 'gsk_ISI_API_KEY_GROQ_KAMU_DISINI',
        model: 'llama-3.3-70b-versatile'
      },
      {
        name: 'OpenRouter',
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: 'sk-or-v1-ISI_API_KEY_OPENROUTER_KAMU_DISINI',
        model: 'openai/gpt-4o-mini'
      }
    ]
    fs.writeFileSync(PROVIDERS_FILE, JSON.stringify(defaultProviders, null, 2), 'utf8')
  }
}

function readMemory() {
  ensureStorage()

  try {
    const data = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'))
    return data && typeof data === 'object' ? data : {}
  } catch {
    return {}
  }
}

function writeMemory(data) {
  ensureStorage()

  const tempFile = `${MEMORY_FILE}.tmp`
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8')
  fs.renameSync(tempFile, MEMORY_FILE)
}

function getChatMemory(chatId) {
  const db = readMemory()

  if (!db[chatId]) {
    db[chatId] = {
      history: [],
      notes: [],
      updatedAt: Date.now()
    }

    writeMemory(db)
  }

  if (!Array.isArray(db[chatId].history)) {
    db[chatId].history = []
  }

  if (!Array.isArray(db[chatId].notes)) {
    db[chatId].notes = []
  }

  return db[chatId]
}

function saveChatMemory(chatId, memory) {
  const db = readMemory()

  db[chatId] = memory
  db[chatId].updatedAt = Date.now()

  writeMemory(db)
}

function getProviders() {
  ensureProvidersConfig()

  try {
    const rawData = fs.readFileSync(PROVIDERS_FILE, 'utf8')
    const configured = JSON.parse(rawData)

    if (!Array.isArray(configured)) return []

    // Filter provider yang valid (mencegah load jika masih pakai placeholder bawaan)
    const providers = configured.filter(provider =>
      provider &&
      provider.apiKey &&
      !provider.apiKey.includes('ISI_API_KEY') && 
      provider.baseURL &&
      provider.model
    )

    return providers
  } catch (error) {
    console.error('[AI Agent] Gagal membaca ai-providers.json:', error.message)
    return []
  }
}

function trimHistory(history) {
  return history.slice(-MAX_HISTORY)
}

/**
 * Parser matematika sederhana.
 * Mendukung + - * / % ** dan tanda kurung.
 * Tidak menggunakan eval atau menjalankan kode JavaScript.
 */
function calculate(expression) {
  if (typeof expression !== 'string' || expression.length > 200) {
    throw new Error('Ekspresi tidak valid.')
  }

  const tokens = expression.match(
    /\d+(?:\.\d+)?|[()+\-*/%]|\*\*/g
  )

  if (!tokens || tokens.join('') !== expression.replace(/\s+/g, '')) {
    throw new Error('Ekspresi matematika tidak valid.')
  }

  let index = 0

  function parsePrimary() {
    const token = tokens[index++]

    if (token === '+') return parsePrimary()
    if (token === '-') return -parsePrimary()

    if (token === '(') {
      const value = parseExpression()

      if (tokens[index++] !== ')') {
        throw new Error('Kurung tidak lengkap.')
      }

      return value
    }

    if (!token || !/^\d+(?:\.\d+)?$/.test(token)) {
      throw new Error('Angka tidak valid.')
    }

    return Number(token)
  }

  function parsePower() {
    let value = parsePrimary()

    if (tokens[index] === '**') {
      index++
      value **= parseUnary()
    }

    return value
  }

  function parseUnary() {
    if (tokens[index] === '+') {
      index++
      return parseUnary()
    }

    if (tokens[index] === '-') {
      index++
      return -parseUnary()
    }

    return parsePower()
  }

  function parseMultiply() {
    let value = parseUnary()

    while (['*', '/', '%'].includes(tokens[index])) {
      const operator = tokens[index++]
      const right = parseUnary()

      if ((operator === '/' || operator === '%') && right === 0) {
        throw new Error('Tidak bisa membagi dengan nol.')
      }

      if (operator === '*') value *= right
      if (operator === '/') value /= right
      if (operator === '%') value %= right
    }

    return value
  }

  function parseExpression() {
    let value = parseMultiply()

    while (tokens[index] === '+' || tokens[index] === '-') {
      const operator = tokens[index++]
      const right = parseMultiply()

      value = operator === '+'
        ? value + right
        : value - right
    }

    return value
  }

  const result = parseExpression()

  if (index !== tokens.length || !Number.isFinite(result)) {
    throw new Error('Hasil perhitungan tidak valid.')
  }

  return result
}

function normalizeText(value) {
  return String(value ?? '').trim()
}

async function executeTool(name, args, chatId, memory) {
  switch (name) {
    case 'calculator': {
      const result = calculate(args.expression)

      return {
        success: true,
        expression: args.expression,
        result
      }
    }

    case 'remember': {
      const note = normalizeText(args.note)

      if (!note) {
        return { success: false, error: 'Catatan kosong.' }
      }

      memory.notes.push({
        note: note.slice(0, 2000),
        createdAt: Date.now()
      })

      memory.notes = memory.notes.slice(-100)
      saveChatMemory(chatId, memory)

      return {
        success: true,
        message: 'Catatan berhasil disimpan.'
      }
    }

    case 'memory_search': {
      const query = normalizeText(args.query).toLowerCase()

      const matches = memory.notes
        .filter(item => item.note.toLowerCase().includes(query))
        .slice(-10)

      return {
        success: true,
        matches
      }
    }

    default:
      return {
        success: false,
        error: `Tool "${name}" tidak tersedia.`
      }
  }
}

async function fetchWithTimeout(url, options, timeout = REQUEST_TIMEOUT) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    })
  } finally {
    clearTimeout(timer)
  }
}

async function requestProvider(provider, messages) {
  const baseURL = provider.baseURL.replace(/\/+$/, '')
  const url = `${baseURL}/chat/completions`

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      tools: TOOL_DEFINITIONS,
      tool_choice: 'auto',
      temperature: 0.7
    })
  })

  const raw = await response.text()

  let data

  try {
    data = JSON.parse(raw)
  } catch {
    throw new Error(
      `${provider.name || provider.model}: respons API bukan JSON.`
    )
  }

  if (!response.ok) {
    throw new Error(
      `${provider.name || provider.model}: ${
        data?.error?.message || response.statusText
      }`
    )
  }

  const message = data?.choices?.[0]?.message

  if (!message) {
    throw new Error('Respons AI kosong.')
  }

  return message
}

async function runAgent(chatId, userText) {
  const providers = getProviders()

  if (!providers.length) {
    throw new Error(
      'Provider AI belum diatur atau API Key masih default. Silakan isi API Key kamu di file `lib/ai-providers.json`.'
    )
  }

  const memory = getChatMemory(chatId)

  const messages = [
    {
      role: 'system',
      content: SYSTEM_PROMPT
    },
    ...memory.history,
    {
      role: 'user',
      content: userText
    }
  ]

  let lastError

  async function askAI(currentMessages) {
    for (const provider of providers) {
      try {
        return await requestProvider(provider, currentMessages)
      } catch (error) {
        lastError = error
        console.error(
          `[AI Agent] Provider ${provider.name || provider.model} gagal:`,
          error.message
        )
      }
    }

    throw lastError || new Error('Semua provider AI gagal.')
  }

  let answer = ''

  for (let step = 0; step < MAX_TOOL_STEPS; step++) {
    const aiMessage = await askAI(messages)

    messages.push({
      role: 'assistant',
      content: aiMessage.content || null,
      ...(aiMessage.tool_calls
        ? { tool_calls: aiMessage.tool_calls }
        : {})
    })

    const toolCalls = aiMessage.tool_calls || []

    if (!toolCalls.length) {
      answer = normalizeText(aiMessage.content)

      if (!answer) {
        answer = 'Hmm, vanXone belum mendapat jawaban dari AI. Coba lagi yaa.'
      }

      break
    }

    for (const toolCall of toolCalls) {
      const name = toolCall.function?.name
      let args = {}

      try {
        args = JSON.parse(toolCall.function?.arguments || '{}')
      } catch {
        args = {}
      }

      let result

      try {
        result = await executeTool(name, args, chatId, memory)
      } catch (error) {
        result = {
          success: false,
          error: error.message
        }
      }

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result)
      })
    }
  }

  if (!answer) {
    const finalMessages = [
      ...messages,
      {
        role: 'system',
        content: 'Berikan jawaban akhir sekarang. Jangan panggil tools lagi.'
      }
    ]

    const finalResponse = await askAI(finalMessages)
    answer = normalizeText(finalResponse.content)
  }

  memory.history.push(
    { role: 'user', content: userText },
    { role: 'assistant', content: answer }
  )

  memory.history = trimHistory(memory.history)
  saveChatMemory(chatId, memory)

  return answer
}

async function sendAIRich(conn, jid, answer) {
  try {
    const rich = new AIRich(conn)

    rich
      .addText(answer)
      .addMetadata(global.namebot || '❀ vanXone • AI AGENT')
      .addSuggest([
        'Jelaskan lebih lanjut',
        'Beri contoh'
      ])

    await rich.send(jid)
    return true
  } catch (error) {
    console.error('[AI Agent] AIRich gagal:', error.message)
    return false
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const input = normalizeText(text)

  if (!input) {
    return m.reply(
      `✨ *vanXone AI AGENT*\n\n` +
      `Contoh penggunaan:\n` +
      `• ${usedPrefix + command} Halo vanXone!\n` +
      `• ${usedPrefix + command} Hitung (25 × 4) / 2\n` +
      `• ${usedPrefix + command} Ingat nama project-ku vanXone\n\n` +
      `vanXone bisa menjawab, menghitung, dan menyimpan catatan di chat ini. Waku waku!`
    )
  }

  await m.react('⏳')

  try {
    const answer = await runAgent(m.chat, input)

    const sent = await sendAIRich(conn, m.chat, answer)

    if (!sent) {
      await conn.sendMessage(
        m.chat,
        { text: answer },
        { quoted: m }
      )
    }

    await m.react('✨')
  } catch (error) {
    console.error('[AI Agent Error]', error)

    await m.react('❌')
    await m.reply(
      `❌ *AI Agent Error*\n\n${error.message}\n\n` +
      `Cek konfigurasi provider AI di file \`lib/ai-providers.json\`, yaa.`
    )
  }
}

handler.help = ['agent <pertanyaan>']
handler.tags = ['ai']
handler.command = /^(agent|aiagent)$/i
handler.limit = false

export default handler