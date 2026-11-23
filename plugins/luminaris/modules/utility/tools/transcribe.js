import { CHAT } from '../../../_runtime/core-shim.js'
import { logger } from '../../../_runtime/core-shim.js'
import { downloadMediaMessage } from '@whiskeysockets/baileys'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { randomBytes } from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const BASE = "https://audioconvert.ai"
const PAGE_URL = `${BASE}/id`
const JWT_SECRET = "auc995cx6se"
const LANGUAGE_CODE = ""
const SCENARIO = "auto"
const USER_AGENT = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36"

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=+$/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}

function createGuestBearer(userId = crypto.randomUUID()) {
  const header = { alg: "HS256", typ: "JWT" }
  const payload = { userId }
  const encodedHeader = base64url(JSON.stringify(header))
  const encodedPayload = base64url(JSON.stringify(payload))
  const data = `${encodedHeader}.${encodedPayload}`
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(data)
    .digest("base64")
    .replace(/=+$/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")

  return { userId, token: `${data}.${signature}` }
}

const guest = createGuestBearer()
const headersBase = {
  "user-agent": USER_AGENT,
  "authorization": `Bearer ${guest.token}`,
  "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
  "referer": PAGE_URL,
  "sec-ch-ua": `"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"`,
  "sec-ch-ua-mobile": "?1",
  "sec-ch-ua-platform": `"Android"`
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function getDurationMinutes(filePath) {
  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v", "error", "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1", filePath
    ])
    const seconds = Number(stdout.trim())
    if (!Number.isFinite(seconds) || seconds <= 0) return 1
    return Math.max(1, Math.ceil(seconds / 60))
  } catch {
    return 1 // Fallback to 1 minute if ffprobe fails
  }
}

async function warmup() {
  await fetch(PAGE_URL, {
    headers: {
      "user-agent": USER_AGENT,
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      "referer": BASE,
      "upgrade-insecure-requests": "1"
    }
  })
}

async function presign(filename) {
  const url = `${BASE}/api/resource/upload/presign?filename=${encodeURIComponent(filename)}`
  const res = await fetch(url, { headers: { ...headersBase, accept: "*/*" } })
  const data = await res.json()

  if (res.status < 200 || res.status >= 300 || data?.code !== 100000 || !data?.data?.upload_url) {
    throw new Error(`Presign gagal HTTP ${res.status}: ${JSON.stringify(data)}`)
  }
  return data.data.upload_url
}

async function uploadToOss(uploadUrl, filePath) {
  const fileSize = fs.statSync(filePath).size
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: fs.createReadStream(filePath),
    headers: { "Content-Length": fileSize }
  })

  if (res.status >= 200 && res.status < 300) {
    return uploadUrl.split("?")[0]
  }
  throw new Error(`Upload OSS gagal HTTP ${res.status}`)
}

async function checkGuestQuota(durationMinutes) {
  const res = await fetch(`${BASE}/api/transcribe/check-guest-quota`, {
    method: "POST",
    headers: { ...headersBase, "content-type": "application/json", origin: BASE },
    body: JSON.stringify({ duration_minutes: durationMinutes })
  })
  const data = await res.json()

  if (res.status < 200 || res.status >= 300 || data?.code !== 100000) {
    throw new Error(`Check quota gagal HTTP ${res.status}`)
  }
  if (!data?.data?.allowed) {
    throw new Error("Quota harian habis atau file terlalu panjang.")
  }
}

async function createTranscribe(audioUrl, fileName) {
  const res = await fetch(`${BASE}/api/transcribe/`, {
    method: "POST",
    headers: { ...headersBase, "content-type": "application/json", origin: BASE },
    body: JSON.stringify({ audio_url: audioUrl, language_code: LANGUAGE_CODE, file_name: fileName, scenario: SCENARIO })
  })
  const data = await res.json()

  if (res.status < 200 || res.status >= 300 || data?.code !== 100000 || !data?.data?.id) {
    throw new Error(`Submit transcribe gagal: ${JSON.stringify(data)}`)
  }
  return data.data
}

async function pollResult(taskId) {
  for (let i = 0; i < 40; i++) { // Max 2 minutes polling
    const res = await fetch(`${BASE}/api/transcribe/${taskId}`, {
      headers: { ...headersBase, accept: "*/*" }
    })
    const data = await res.json()

    if (data?.code === 100001 || data?.message === "Need Login") {
      return { done: false, need_login: true, text: null }
    }

    if (res.status >= 200 && res.status < 300 && data?.code === 100000) {
      const task = data.data
      const text = task?.text ?? task?.transcript ?? task?.result ?? task?.content ?? task?.transcription ?? null

      if (task?.status === "succeeded" || task?.status === "success" || task?.status === "completed" || text) {
        return { done: true, need_login: false, text }
      }
      if (task?.status === "failed" || task?.status === "error") {
        throw new Error(task?.error ?? data?.message ?? "Transcribe failed")
      }
    }
    await sleep(3000)
  }
  return { done: false, need_login: false, text: null }
}

export default {
  name: 'transcribe',
  command: ['transcribe', 'stt', 'vn', 'tovn'],
  event: [],
  allow: CHAT.BOTH,
  roleRequired: 10,
  category: 'tools',
  description: 'Ubah voice note atau audio menjadi teks (Speech to Text)',

  async handle(ctx) {
    const { sock, msg, chat } = ctx
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage

    // Check if it's an audio/ptt message (either direct or quoted)
    const targetMsg = quoted ? { key: { remoteJid: chat, fromMe: false, id: msg.message.extendedTextMessage.contextInfo.stanzaId, participant: msg.message.extendedTextMessage.contextInfo.participant }, message: quoted } : msg
    const isAudio = targetMsg.message?.audioMessage || targetMsg.message?.pttMessage

    if (!isAudio) {
      return sock.sendMessage(chat, { 
        text: '❌ Please reply to a voice note or audio message to transcribe.\nExample: Reply to VN with `!stt`' 
      }, { quoted: msg })
    }

    await sock.sendMessage(chat, { react: { text: '⏳', key: msg.key } })

    const tempPath = path.join(tmpdir(), `audio_${randomBytes(4).toString('hex')}.mp3`)

    try {
      // 1. Download media to temp file
      const buffer = await downloadMediaMessage(targetMsg, 'buffer', {}, { logger: { level: 'silent' } })
      if (!buffer || buffer.length === 0) throw new Error("Gagal mengunduh audio.")
      
      fs.writeFileSync(tempPath, buffer)

      // 2. Run Transcription Pipeline
      await sock.sendMessage(chat, { text: '⏳ *Sedang memproses audio...* (Maksimal 1-2 menit)' }, { quoted: msg })
      
      await warmup()
      const fileName = path.basename(tempPath)
      const durationMinutes = await getDurationMinutes(tempPath)

      const uploadUrl = await presign(fileName)
      const audioUrl = await uploadToOss(uploadUrl, tempPath)

      await checkGuestQuota(durationMinutes)
      const task = await createTranscribe(audioUrl, fileName)
      const poll = await pollResult(task.id)

      // 3. Send Result
      if (!poll.done || poll.need_login || !poll.text) {
        throw new Error("Gagal mengekstrak teks atau batas kuota harian tercapai.")
      }

      // Truncate if too long for WhatsApp
      const finalText = poll.text.length > 4000 ? poll.text.slice(0, 3990) + '...\n\n_(Teks dipotong karena terlalu panjang)_ ' : poll.text

      await sock.sendMessage(chat, { 
        text: `*Hasil Transkripsi:*\n\n${finalText}` 
      }, { quoted: msg })

      await sock.sendMessage(chat, { react: { text: '✅', key: msg.key } })

    } catch (error) {
      logger.error('transcribe error', error)
      await sock.sendMessage(chat, { 
        text: `❌ Gagal memproses audio: ${error.message}` 
      }, { quoted: msg })
      await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
    } finally {
      // 4. Cleanup temp file
      fs.unlink(tempPath, (err) => {
        if (err) logger.debug(`Failed to delete temp file: ${tempPath}`)
      })
    }
  }
}