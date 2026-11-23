import { spawn } from 'node:child_process'
import sharp from 'sharp'

import { CHAT, config, extractMedia, logger } from '../../../_runtime/core-shim.js'

// Port dari plugin jjcapcut (Zw) ke kontrak plugin LuminarisMD.
//
//   !jjlist              — daftar template
//   !jjsearch <kata>     — cari template
//   !jjrender <nomor/id> — render video dari gambar
//
// API tetap memakai server yang sama dengan plugin aslinya. Semua teks yang
// dilihat user memakai Bahasa Indonesia.

const BASE_URL = 'https://cc.fgsi.dpdns.org'
const REQUEST_TIMEOUT_MS = 30_000
const POLL_INTERVAL_MS = 5_000
const MAX_POLL_ATTEMPTS = 100

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Origin: BASE_URL,
  Referer: `${BASE_URL}/`
}

function request(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  return fetch(url, {
    ...options,
    signal: options.signal || AbortSignal.timeout(timeoutMs)
  })
}

function short(text, max = 180) {
  const value = String(text ?? '').replace(/\s+/g, ' ').trim()
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

function templateFromEntry(key, value, fallbackIndex) {
  if (!value || typeof value !== 'object' || value.id == null) return null

  const parsedIndex = Number(key)
  return {
    index: Number.isFinite(parsedIndex) && parsedIndex > 0 ? parsedIndex : fallbackIndex,
    id: String(value.id),
    title: short(value.title || 'Tanpa judul', 120),
    mediaCount: Math.max(1, Number(value.mediaCount) || 1),
    resolusi: String(value.resolusi || '9:16')
  }
}

function normalizeTemplateList(payload) {
  if (Array.isArray(payload)) {
    return payload
      .map((item, i) => templateFromEntry(i + 1, item, i + 1))
      .filter(Boolean)
  }

  if (!payload || typeof payload !== 'object') return []

  // Beberapa versi API membungkus daftar di dalam `templates` atau `data`.
  // Format utama plugin asli tetap didukung: object dengan key nomor urut.
  const wrapped = Array.isArray(payload.templates)
    ? payload.templates
    : Array.isArray(payload.data)
      ? payload.data
      : null

  if (wrapped) {
    return wrapped
      .map((item, i) => templateFromEntry(i + 1, item, i + 1))
      .filter(Boolean)
  }

  return Object.entries(payload)
    .map(([key, value], i) => templateFromEntry(key, value, i + 1))
    .filter(Boolean)
}

function normalizeSearchResults(payload) {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []

  for (const key of ['results', 'templates', 'items', 'data']) {
    if (Array.isArray(payload[key])) return payload[key]
  }

  if (payload.data && typeof payload.data === 'object') {
    for (const key of ['results', 'templates', 'items']) {
      if (Array.isArray(payload.data[key])) return payload.data[key]
    }
  }

  return []
}

function authorName(item) {
  const author = item?.author
  if (typeof author === 'string') return author
  return author?.name || item?.authorName || item?.username || 'Tidak diketahui'
}

class JJCapcut {
  constructor(baseUrl = BASE_URL) {
    this.baseUrl = baseUrl
    this.headers = { ...HEADERS, Origin: baseUrl, Referer: `${baseUrl}/` }
  }

  async getCookie(templateId = '') {
    try {
      const url = templateId ? `${this.baseUrl}/create/${templateId}` : `${this.baseUrl}/`
      const res = await request(url, { headers: this.headers }, 15_000)
      const setCookie = res.headers.get('set-cookie') || ''
      return setCookie.split(';')[0] || ''
    } catch {
      return ''
    }
  }

  async list() {
    try {
      const res = await request(`${this.baseUrl}/list`, { headers: this.headers })
      if (res.ok) {
        const json = await res.json()
        const templates = normalizeTemplateList(json)
        if (templates.length) return templates
      }
    } catch {}

    // Fallback lama: halaman utama menyimpan daftar template di __NEXT_DATA__.
    try {
      const res = await request(`${this.baseUrl}/`, { headers: this.headers })
      if (!res.ok) return []

      const html = await res.text()
      const match = html.match(/<script[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i)
      if (!match) return []

      const data = JSON.parse(match[1])
      const templates = data?.props?.pageProps?.templates
      return normalizeTemplateList(templates || [])
    } catch (error) {
      logger.warn('jjcapcut: gagal mengambil fallback daftar template', error)
      return []
    }
  }

  async search(query = '', limit = 10, offset = 0) {
    const keyword = String(query || '').trim()
    if (!keyword) throw new Error('Kata kunci pencarian wajib diisi.')

    const cookie = await this.getCookie()
    const url = `${this.baseUrl}/search?q=${encodeURIComponent(keyword)}&limit=${limit}&offset=${offset}`
    const headers = { ...this.headers }
    if (cookie) headers.Cookie = cookie

    const res = await request(url, { headers })
    if (!res.ok) {
      throw new Error(`Permintaan pencarian gagal (HTTP ${res.status}).`)
    }

    return normalizeSearchResults(await res.json())
  }

  async create(templateId, images = []) {
    if (!templateId) throw new Error('ID template wajib diisi.')
    if (!Array.isArray(images) || images.length === 0) {
      throw new Error('Gambar wajib dikirim untuk melakukan render.')
    }

    const cookie = await this.getCookie(templateId)
    const form = new FormData()
    form.append('id', String(templateId))

    for (let i = 0; i < images.length; i++) {
      const raw = images[i]
      const data = Buffer.isBuffer(raw) ? raw : raw?.buffer
      const mimetype = Buffer.isBuffer(raw) ? 'image/jpeg' : raw?.mimetype || 'image/jpeg'
      if (!data?.length) continue

      const blob = new Blob([data], { type: mimetype })
      form.append('files', blob, `image_${i + 1}.jpg`)
    }

    const headers = {
      ...this.headers,
      Referer: `${this.baseUrl}/create/${templateId}`
    }
    if (cookie) headers.Cookie = cookie

    const res = await request(`${this.baseUrl}/jj`, {
      method: 'POST',
      body: form,
      headers
    }, 60_000)

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      throw new Error(`Gagal membuat tugas render (HTTP ${res.status})${errText ? `: ${short(errText)}` : ''}`)
    }

    const json = await res.json().catch(() => ({}))
    if (!json.task_id) {
      throw new Error(json.error || json.message || 'Server tidak mengembalikan ID tugas render.')
    }

    return { taskId: json.task_id, cookie, templateId }
  }

  async checkTask(taskId, templateId = '', cookie = '') {
    if (!taskId) throw new Error('ID tugas render wajib diisi.')

    const headers = {
      ...this.headers,
      Referer: templateId ? `${this.baseUrl}/create/${templateId}` : `${this.baseUrl}/`
    }
    if (cookie) headers.Cookie = cookie

    const res = await request(`${this.baseUrl}/task/${taskId}`, { headers })
    if (!res.ok) {
      throw new Error(`Pemeriksaan status render gagal (HTTP ${res.status}).`)
    }

    const json = await res.json()
    const video = json.video
    const videoUrl =
      video?.videoUrl ||
      (typeof video === 'string' ? video : null) ||
      json.result?.videoUrl ||
      json.result?.url ||
      (typeof json.result === 'string' ? json.result : null) ||
      json.url ||
      null

    return {
      status: json.status,
      videoUrl,
      error: json.error || null,
      raw: json
    }
  }

  async render(templateId, images = [], options = {}) {
    const {
      interval = POLL_INTERVAL_MS,
      maxRetries = MAX_POLL_ATTEMPTS,
      onProgress = null
    } = options

    const task = await this.create(templateId, images)
    const { taskId, cookie } = task

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, interval))

      let result
      try {
        result = await this.checkTask(taskId, templateId, cookie)
      } catch {
        continue
      }

      if (typeof onProgress === 'function') {
        onProgress({ attempt, maxRetries, status: result.status, taskId })
      }

      if (result.videoUrl) {
        return { status: 'success', taskId, templateId, videoUrl: result.videoUrl }
      }

      if (result.status === 'error') {
        const message = String(result.error || 'Kesalahan tidak diketahui')
        if (message.includes('503')) {
          throw new Error('Server CapCut sedang tidak tersedia (HTTP 503). Coba lagi nanti.')
        }
        throw new Error(`Render gagal: ${message}`)
      }
    }

    throw new Error('Proses render melewati batas waktu. Coba lagi nanti.')
  }
}

const jj = new JJCapcut()

async function compressImageBuffer(buffer) {
  return sharp(buffer, { failOn: 'none' })
    .rotate()
    .resize({ width: 720, withoutEnlargement: true })
    .jpeg({ quality: 70, mozjpeg: true })
    .toBuffer()
}

let ffmpegReady = null

function hasFfmpeg() {
  if (ffmpegReady !== null) return Promise.resolve(ffmpegReady)

  ffmpegReady = new Promise((resolve) => {
    const check = spawn('ffmpeg', ['-version'], { stdio: 'ignore' })
    check.once('error', () => resolve(false))
    check.once('close', (code) => resolve(code === 0))
  })

  return ffmpegReady
}

async function compressVideoBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-hide_banner',
      '-loglevel', 'error',
      '-i', 'pipe:0',
      '-vcodec', 'libx264',
      '-crf', '28',
      '-preset', 'ultrafast',
      '-f', 'mp4',
      '-movflags', 'frag_keyframe+empty_moov',
      'pipe:1'
    ])

    const chunks = []
    const timer = setTimeout(() => {
      ffmpeg.kill('SIGKILL')
      reject(new Error('Kompresi video melewati batas waktu.'))
    }, 120_000)

    ffmpeg.stdout.on('data', (chunk) => chunks.push(chunk))
    ffmpeg.once('error', (error) => {
      clearTimeout(timer)
      reject(error)
    })
    ffmpeg.once('close', (code) => {
      clearTimeout(timer)
      if (code === 0) resolve(Buffer.concat(chunks))
      else reject(new Error(`FFmpeg berhenti dengan kode ${code}.`))
    })

    ffmpeg.stdin.write(buffer)
    ffmpeg.stdin.end()
  })
}

async function prepareVideo(videoUrl) {
  // Kalau ffmpeg tidak tersedia, kirim URL asli. Baileys tetap bisa
  // mengunduh dan mengunggah media dari URL.
  if (!(await hasFfmpeg())) return { url: videoUrl }

  try {
    const res = await request(videoUrl, {}, 120_000)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buffer = Buffer.from(await res.arrayBuffer())
    return { buffer: await compressVideoBuffer(buffer) }
  } catch (error) {
    logger.warn(`jjcapcut: gagal mengompres video, memakai URL asli (${error.message})`)
    return { url: videoUrl }
  }
}

function helpText(prefix) {
  return [
    '*🎬 JJ CAPCUT*',
    'Buat video dari template CapCut.',
    '',
    '*Daftar perintah*',
    `• ${prefix}jjlist — lihat semua template`,
    `• ${prefix}jjsearch <kata kunci> — cari template`,
    `• ${prefix}jjrender <nomor/id> — render video dari gambar`,
    '',
    '*Cara pakai*',
    `1. Cari template: ${prefix}jjsearch jedag jedug`,
    `2. Kirim atau balas gambar dengan caption: ${prefix}jjrender 1`,
    '',
    '_Nomor template mengikuti daftar di jjlist. ID template juga bisa dipakai._'
  ].join('\n')
}

function imagePrompt(prefix, input) {
  return [
    '📸 *Gambar tidak ditemukan.*',
    '',
    'Kirim gambar dengan caption:',
    `> ${prefix}jjrender ${input}`,
    '',
    'Atau balas gambar yang sudah ada dengan:',
    `> ${prefix}jjrender ${input}`
  ].join('\n')
}

function renderRecipe(prefix) {
  return [
    '❓ *Masukkan nomor urut atau ID template.*',
    '',
    `📌 Pakai nomor: ${prefix}jjrender 1`,
    `📌 Pakai ID: ${prefix}jjrender 7649585745329540360`,
    '',
    `Lihat daftar nomor dengan ${prefix}jjlist atau cari template dengan ${prefix}jjsearch.`
  ].join('\n')
}

async function sendList(ctx) {
  const prefix = ctx.prefix || '!'
  await ctx.reply.react('🔄')
  await ctx.reply('🔄 *Mengambil daftar template...*')

  try {
    const templates = await jj.list()
    if (!templates.length) {
      await ctx.reply.react('❌')
      return ctx.reply('❌ *Gagal mengambil daftar template.*\n\nServer sedang tidak merespons atau daftar template kosong. Coba lagi nanti.')
    }

    const lines = ['╭━━━〔 🎬 DAFTAR TEMPLATE CAPCUT 〕━━━⬣', '│']
    for (const template of templates) {
      lines.push(`│ *${template.index}.* ${template.title}`)
      lines.push(`│ ↳ 🆔 ID: \`${template.id}\``)
      lines.push(`│ ↳ 📸 Butuh: ${template.mediaCount} foto | 📐 Rasio: ${template.resolusi}`)
      lines.push('│')
    }
    lines.push('╰━━━━━━━━━━━━━━━━⬣', '')
    lines.push('💡 *Cara pakai:*')
    lines.push('> Kirim atau balas gambar dengan caption')
    lines.push(`> ${prefix}jjrender <nomor/id>`)

    await ctx.reply.react('✅')
    return ctx.reply(lines.join('\n'))
  } catch (error) {
    logger.error('jjcapcut: gagal menampilkan daftar template', error)
    await ctx.reply.react('❌')
    return ctx.reply(`❌ *Gagal mengambil daftar template.*\n\n> ${short(error.message)}`)
  }
}

async function sendSearch(ctx) {
  const prefix = ctx.prefix || '!'
  const query = ctx.args.join(' ').trim()

  if (!query) {
    return ctx.reply([
      '❓ *Masukkan kata kunci pencarian.*',
      '',
      '📌 Contoh:',
      `> ${prefix}jjsearch jedag jedug`
    ].join('\n'))
  }

  await ctx.reply.react('🔍')
  await ctx.reply(`🔍 *Mencari template:* ${query}`)

  try {
    const results = await jj.search(query, 5, 0)
    if (!results.length) {
      await ctx.reply.react('❌')
      return ctx.reply(`❌ *Template tidak ditemukan untuk:* ${query}`)
    }

    const lines = ['╭━━━〔 🔍 HASIL PENCARIAN 〕━━━⬣', '│']
    results.forEach((item, index) => {
      const title = short(item.title || 'Tanpa judul', 120)
      lines.push(`│ *${index + 1}.* ${title}`)
      lines.push(`│ ↳ 🆔 ID: \`${item.id}\``)
      lines.push(`│ ↳ 👤 Pembuat: ${authorName(item)}`)
      lines.push('│')
    })
    lines.push('╰━━━━━━━━━━━━━━━━⬣', '')
    lines.push(`Gunakan ID di atas untuk render, contoh: *${prefix}jjrender ${results[0].id}*`)

    await ctx.reply.react('✅')
    return ctx.reply(lines.join('\n'))
  } catch (error) {
    logger.error('jjcapcut: gagal mencari template', error)
    await ctx.reply.react('❌')
    return ctx.reply(`❌ *Pencarian gagal.*\n\n> ${short(error.message)}`)
  }
}

async function resolveTemplate(input, prefix) {
  const templates = await jj.list()
  const byNumber = /^\d{1,4}$/.test(input) ? templates.find((item) => item.index === Number(input)) : null
  const found = byNumber || templates.find((item) => item.id === input) || null

  if (/^\d{1,4}$/.test(input) && !found) {
    const error = new Error(`Nomor template *${input}* tidak ada di daftar. Lihat daftar dengan ${prefix}jjlist.`)
    error.userMessage = true
    throw error
  }

  return {
    templateId: found?.id || input,
    mediaCount: Math.max(1, Number(found?.mediaCount) || 1)
  }
}

async function sendRender(ctx) {
  const prefix = ctx.prefix || '!'
  const input = String(ctx.args[0] || '').trim()

  if (!input) return ctx.reply(renderRecipe(prefix))

  const directImage = ctx.msg?.message?.imageMessage
  const quotedImage = ctx.msg?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage
  if (!directImage && !quotedImage) return ctx.reply(imagePrompt(prefix, input))

  await ctx.reply.react('⏳')
  await ctx.reply('⏳ *Menyiapkan render...*')

  let template
  try {
    template = await resolveTemplate(input, prefix)
  } catch (error) {
    await ctx.reply.react('❌')
    return ctx.reply(`❌ ${error.userMessage ? error.message : `Gagal mengambil daftar template.\n\n> ${short(error.message)}`}`)
  }

  const { templateId, mediaCount } = template
  await ctx.reply(
    `⏳ *Memproses template* (butuh ${mediaCount} foto)\n\n` +
    '> Bot akan mengunduh dan mengompres gambar terlebih dahulu.'
  )

  let image
  try {
    image = await extractMedia(ctx.msg, ctx.chat)
  } catch (error) {
    logger.warn(`jjcapcut: gagal mengunduh gambar (${error.message})`)
    await ctx.reply.react('❌')
    return ctx.reply(`❌ *Gagal mengunduh gambar.*\n\n> ${short(error.message)}`)
  }

  if (!image?.buffer?.length || !String(image.mimetype || '').startsWith('image/')) {
    await ctx.reply.react('❌')
    return ctx.reply(imagePrompt(prefix, input))
  }

  try {
    image.buffer = await compressImageBuffer(image.buffer)
    image.mimetype = 'image/jpeg'
  } catch (error) {
    logger.warn(`jjcapcut: gagal mengompres gambar, memakai file asli (${error.message})`)
  }

  try {
    const images = Array.from({ length: mediaCount }, () => ({
      buffer: image.buffer,
      mimetype: image.mimetype
    }))

    const result = await jj.render(templateId, images, {
      interval: POLL_INTERVAL_MS,
      maxRetries: MAX_POLL_ATTEMPTS
    })

    await ctx.reply('✅ *Video berhasil dibuat!*\n\n> Sedang menyiapkan video sebelum dikirim...')

    const video = await prepareVideo(result.videoUrl)
    await ctx.sock.sendMessage(ctx.chat, {
      video: video.buffer || video.url,
      mimetype: 'video/mp4',
      caption: [
        '✅ *Render CapCut selesai!*',
        '',
        `🆔 Template: \`${templateId}\``,
        `🎞️ ${mediaCount} foto dipakai`,
        '',
        `💕 ${config.botName}`
      ].join('\n')
    }, { quoted: ctx.msg })

    await ctx.reply.react('💗')
  } catch (error) {
    logger.error('jjcapcut: render gagal', error)
    await ctx.reply.react('❌')
    return ctx.reply(`❌ *Render gagal.*\n\n> ${short(error.message)}`)
  }
}

export default {
  name: 'jjcapcut',
  command: ['jjcapcut', 'jjlist', 'jjsearch', 'jjrender', 'capcutjj'],
  event: [],
  allow: CHAT.BOTH,
  roleRequired: 10,
  category: 'tools',
  description: 'Buat video CapCut dari template',

  async handle(ctx) {
    const trigger = String(ctx.trigger || '').toLowerCase()

    if (trigger === 'jjlist') return sendList(ctx)
    if (trigger === 'jjsearch') return sendSearch(ctx)
    if (trigger === 'jjrender') return sendRender(ctx)

    return ctx.reply(helpText(ctx.prefix || '!'))
  }
}

// Dipakai test untuk memeriksa pemetaan respons API tanpa memanggil handler
// yang mengirim media ke WhatsApp.
export const __test = {
  JJCapcut,
  normalizeTemplateList,
  normalizeSearchResults,
  compressImageBuffer
}
