import { createHash, createHmac, randomBytes, randomUUID } from 'node:crypto'
import { CHAT, logger } from '../../_runtime/core-shim.js'

const HOST = 'https://amfinder.web.id'
const HANDSHAKE = `${HOST}/api/v/7f91a2e4`
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'
const TOKEN_TIMEOUT = 60_000
const STREAM_TIMEOUT = 180_000

function numericEnv() {
  // e.c di browser adalah hash canvas bertipe integer 32-bit. Server menolak
  // nilai string/0, jadi kirim integer non-nol yang masih masuk akal.
  let value = randomBytes(4).readUInt32BE(0) & 0x7fffffff
  if (value === 0) value = 1
  return {
    c: value,
    sw: 1920,
    sh: 1080,
    cd: 24,
    dpr: 1,
    tz: 'Asia/Jakarta',
    tzo: -420,
    hc: 8,
    mtp: 0,
    w: true,
    d: true
  }
}

export function computeBsig(cid, salt, env) {
  const payload = [
    cid,
    salt,
    env.c,
    `${env.sw}x${env.sh}`,
    env.cd,
    env.tz,
    env.tzo,
    env.hc
  ].join('|')
  return createHash('sha256').update(payload).digest('hex')
}

export function computeProof(saltHex, message, rounds) {
  const key = Buffer.from(saltHex, 'hex')
  let data = Buffer.from(message, 'utf8')
  const total = Math.max(1, Math.min(100_000, Math.floor(Number(rounds) || 1)))
  for (let i = 0; i < total; i++) {
    data = createHmac('sha256', key).update(data).digest()
  }
  return data.toString('hex')
}

async function postJSON(body, timeout = TOKEN_TIMEOUT) {
  const res = await fetch(HANDSHAKE, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: '*/*',
      origin: HOST,
      referer: `${HOST}/`,
      'user-agent': UA
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeout)
  })

  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch {}

  if (!res.ok || json?.ok === false) {
    throw new Error(json?.error || `Handshake AmFinder gagal (HTTP ${res.status}).`)
  }

  return json
}

async function getToken() {
  const did = randomUUID()
  const challenge = await postJSON({ did })
  if (!challenge?.cid || !challenge?.salt || !challenge?.ts) {
    throw new Error('AmFinder tidak mengirim data tantangan.')
  }

  const env = numericEnv()
  const bsig = computeBsig(challenge.cid, challenge.salt, env)
  const message = [challenge.cid, did, challenge.ts, bsig].join('|')
  const proof = computeProof(challenge.salt, message, challenge.rounds)

  const result = await postJSON({
    cid: challenge.cid,
    did,
    ts: challenge.ts,
    proof,
    bsig,
    env,
    score: 0,
    reasons: []
  })

  if (!result?.token) throw new Error('AmFinder tidak mengirim token akses.')
  return result.token
}

export function parseSSEBlock(block) {
  const eventLine = /(?:^|\n)event:[ \t]*(.+)/.exec(block)
  const dataLine = /(?:^|\n)data:[ \t]?([\s\S]*)/.exec(block)
  if (!eventLine) return null

  const event = eventLine[1].trim()
  const raw = dataLine?.[1] ?? ''
  let data = raw
  try { data = JSON.parse(raw) } catch {}
  return { event, data }
}

async function readSSE(endpoint, token, onEvent) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), STREAM_TIMEOUT)

  try {
    const res = await fetch(`${endpoint}${endpoint.includes('?') ? '&' : '?'}t=${encodeURIComponent(token)}`, {
      headers: {
        accept: 'text/event-stream',
        'user-agent': UA,
        referer: `${HOST}/`
      },
      signal: controller.signal
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(body.slice(0, 300) || `AmFinder gagal (HTTP ${res.status}).`)
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      let split
      while ((split = buffer.indexOf('\n\n')) >= 0) {
        const block = buffer.slice(0, split)
        buffer = buffer.slice(split + 2)
        const parsed = parseSSEBlock(block)
        if (parsed) await onEvent(parsed.event, parsed.data)
      }
    }

    if (buffer.trim()) {
      const parsed = parseSSEBlock(buffer)
      if (parsed) await onEvent(parsed.event, parsed.data)
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('AmFinder tidak merespons dalam 3 menit.')
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}

async function runSearch(query) {
  const token = await getToken()
  let candidates = null
  let videos = []

  await readSSE(
    `${HOST}/api/search?mode=pick&q=${encodeURIComponent(query)}`,
    token,
    (event, data) => {
      if (event === 'candidates') candidates = Array.isArray(data?.items) ? data.items : []
      else if (event === 'result' && Array.isArray(data?.videos)) videos = data.videos
      else if (event === 'error') throw new Error(data?.message || 'Pencarian AmFinder gagal.')
    }
  )

  if (candidates?.length) return candidates
  return videos
}

async function runFind(url) {
  const token = await getToken()
  let result = null

  await readSSE(
    `${HOST}/api/find?url=${encodeURIComponent(url)}`,
    token,
    (event, data) => {
      if (event === 'result') result = data
      else if (event === 'error') throw new Error(data?.message || 'Pencarian preset gagal.')
    }
  )

  if (!result) throw new Error('Koneksi AmFinder ditutup sebelum hasil dikirim.')
  if (result.ok === false) throw new Error(result.error || 'Server AmFinder menolak permintaan.')
  return result
}

function itemTitle(item) {
  return item?.title || item?.snippet || item?.name || 'Tanpa judul'
}

function itemAuthor(item) {
  return item?.author || item?.handle || item?.username || item?.channel || ''
}

function searchText(query, items, prefix = '!') {
  const lines = [
    '🔍 *HASIL PENCARIAN PRESET ALIGHT MOTION*',
    '',
    `> Query: *${query}*`,
    `> Ditemukan: *${items.length}* hasil`,
    ''
  ]

  items.slice(0, 10).forEach((item, index) => {
    lines.push(`*${index + 1}.* ${String(itemTitle(item)).slice(0, 120)}`)
    if (itemAuthor(item)) lines.push(`> 👤 ${itemAuthor(item)}`)
    if (item?.url) lines.push(`> 🔗 ${item.url}`)
    lines.push('')
  })

  lines.push(`> Salin URL video, lalu kirim: *${prefix}amfind <url>*`)
  return lines.join('\n')
}

function findText(result) {
  if (result.found === false) {
    return [
      '❌ *Preset tidak ditemukan.*',
      '',
      '> Video ini tidak memiliki link preset Alight Motion yang terdeteksi.',
      '> Coba video lain atau cari preset dengan *amfind --search <kata kunci>*.'
    ].join('\n')
  }

  const lines = [
    '🎬 *PRESET ALIGHT MOTION*',
    '',
    '╭──〔 📋 *INFORMASI* 〕──⬣'
  ]

  if (result.videoUrl) lines.push(`│ 🔗 Video: ${result.videoUrl}`)
  if (result.author) lines.push(`│ 👤 Author: ${result.author}`)
  if (result.videoId) lines.push(`│ 🆔 Video ID: ${result.videoId}`)
  if (result.checked) {
    const comments = Number(result.checked.comments) || 0
    lines.push(`│ ✅ Dicek: deskripsi, bio, ${comments} komentar`)
  }
  lines.push('╰───────────────⬣')

  const presets = Array.isArray(result.presetLinks) ? result.presetLinks : []
  if (presets.length) {
    lines.push('', '╭──〔 📥 *LINK PRESET* 〕──⬣')
    presets.slice(0, 10).forEach((preset, index) => {
      const label = preset.title || preset.name || `Preset ${index + 1}`
      const meta = [preset.size, preset.type].filter(Boolean).join(' · ')
      lines.push(`│ ${index + 1}. ${label}${meta ? ` (${meta})` : ''}`)
      if (preset.url) lines.push(`│    ${preset.url}`)
    })
    lines.push('╰───────────────⬣')
  } else {
    lines.push('', '> ⚠️ Tidak ada link preset yang bisa ditampilkan.')
  }

  return lines.join('\n')
}

function presetDocument(result) {
  const direct = [result.xml, result.download, result.file, result.am_link, result.preset_url]
    .find((value) => typeof value === 'string' && /^https?:\/\//i.test(value))
  if (direct) return direct

  const links = Array.isArray(result.presetLinks) ? result.presetLinks : []
  return links
    .map((item) => item?.url)
    .find((url) => typeof url === 'string' && /^https?:\/\//i.test(url) && !/youtu\.?be|youtube\.com/i.test(url)) || null
}

function safeFileName(value) {
  return String(value || 'preset')
    .replace(/[^A-Za-z0-9 _.-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 40) || 'preset'
}

function helpText(prefix) {
  return [
    '🎬 *AMFINDER — PRESET ALIGHT MOTION*',
    '',
    '*Cari preset*',
    `• ${prefix}amfind --search <kata kunci>`,
    `• ${prefix}amfind cari <kata kunci>`,
    '',
    '*Ambil preset dari video TikTok*',
    `• ${prefix}amfind <link-tiktok>`,
    '',
    '*Contoh*',
    `> ${prefix}amfind --search preset keren`,
    `> ${prefix}amfind https://vt.tiktok.com/xxxxx`,
    '',
    '_Bot mencari tautan preset di deskripsi, bio, dan komentar video._'
  ].join('\n')
}

export default {
  name: 'amfinder',
  command: ['amfinder', 'amfind', 'ttsearch', 'tiktokfind', 'ampreset'],
  event: [],
  allow: CHAT.BOTH,
  roleRequired: 10,
  category: 'downloader',
  description: 'Cari dan unduh preset Alight Motion dari video TikTok',

  async handle(ctx) {
    const prefix = ctx.prefix || '!'
    const args = ctx.args || []
    const first = String(args[0] || '').trim()

    if (!first) return ctx.reply(helpText(prefix))

    const isSearch = /^(--search|-s|cari|search)$/i.test(first)
    if (isSearch) {
      const query = args.slice(1).join(' ').trim()
      if (!query) return ctx.reply(`❌ *Kata kunci kosong.*\n\nContoh: *${prefix}amfind --search preset keren*`)

      await ctx.reply.react('🔍')
      await ctx.reply(`🔍 *Mencari preset:* ${query}`)

      try {
        const items = await runSearch(query)
        if (!items?.length) {
          await ctx.reply.react('❌')
          return ctx.reply(`❌ *Tidak ada hasil untuk:* ${query}`)
        }
        await ctx.reply.react('✅')
        return ctx.reply(searchText(query, items, prefix))
      } catch (error) {
        logger.error('amfinder: pencarian gagal', error)
        await ctx.reply.react('❌')
        return ctx.reply(`❌ *Pencarian gagal.*\n\n> ${error.message}`)
      }
    }

    const url = first
    if (!/tiktok\.com|vt\.tiktok|douyin/i.test(url)) {
      return ctx.reply([
        '❌ *Link bukan dari TikTok/Douyin.*',
        '',
        `Contoh: *${prefix}amfind https://vt.tiktok.com/xxxxx*`,
        `Atau cari preset: *${prefix}amfind --search preset keren*`
      ].join('\n'))
    }

    await ctx.reply.react('🔍')
    await ctx.reply('⏳ *Mengambil data preset dari video...*')

    try {
      const result = await runFind(url)
      const text = findText(result)
      await ctx.reply(text)

      const documentUrl = presetDocument(result)
      if (documentUrl) {
        const name = safeFileName(result.presetLinks?.[0]?.title || 'preset')
        try {
          await ctx.sock.sendMessage(ctx.chat, {
            document: { url: documentUrl },
            fileName: `${name}.xml`,
            mimetype: 'text/xml',
            caption: '📄 *File preset Alight Motion*'
          }, { quoted: ctx.msg })
        } catch (error) {
          logger.warn(`amfinder: gagal mengirim file preset (${error.message})`)
        }
      }

      await ctx.reply.react('✅')
    } catch (error) {
      logger.error('amfinder: pengambilan preset gagal', error)
      await ctx.reply.react('❌')
      await ctx.reply([
        '❌ *Gagal mengambil preset.*',
        '',
        `> ${error.message}`,
        '',
        '> Pastikan video publik dan server AmFinder sedang aktif.'
      ].join('\n'))
    }
  }
}

export const __test = {
  computeBsig,
  computeProof,
  parseSSEBlock,
  numericEnv,
  searchText,
  findText
}
