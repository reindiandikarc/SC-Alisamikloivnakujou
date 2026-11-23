import { CHAT, logger } from '../../_runtime/core-shim.js'
import { downloadMediaMessage } from '@whiskeysockets/baileys'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { writeFile, readFile, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { randomBytes } from 'node:crypto'
import sharp from 'sharp'
import { imageTarget, mediaTarget, normalizeFormat, formatSummary, MAX_BYTES } from './lib/formats.js'

const execFileAsync = promisify(execFile)
const TMP = tmpdir()

async function convertBuffer({ data, sourceExt, target }) {
  const image = imageTarget(target)
  if (image) return convertImage({ data, target: image })

  const media = mediaTarget(target)
  return convertMedia({ data, sourceExt, target: media })
}

async function convertImage({ data, target }) {
  const image = sharp(data, { animated: target.animated })

  const pipeline = target.animated ? image : sharp(data)

  const converted = await pipeline
    .toFormat(sharpFormatOf(target.ext))
    .toBuffer()

  return {
    data: converted,
    mimetype: target.mimetype,
    fileName: `converted.${target.ext}`
  }
}

function sharpFormatOf(ext) {
  switch (ext) {
    case 'jpg': return 'jpeg'
    case 'tiff': return 'tiff'
    default: return ext
  }
}

async function convertMedia({ data, sourceExt, target }) {
  const id = randomBytes(5).toString('hex')
  const inputPath = join(TMP, `conv_in_${id}.${sourceExt || 'bin'}`)
  const outputPath = join(TMP, `conv_out_${id}.${target.ext}`)

  try {
    await writeFile(inputPath, data)

    const maps = target.kind === 'audio'
      ? ['-map', '0:a', '-vn']
      : ['-map', '0:v', '-map', '0:a?']

    await execFileAsync(
      'ffmpeg',
      ['-hide_banner', '-loglevel', 'error', '-y',
        '-fflags', '+genpts',
        '-f', sourceExt || 'mp4',
        '-i', inputPath,
        ...maps,
        ...target.args,
        outputPath],
      { maxBuffer: 50 * 1024 * 1024, timeout: 5 * 60 * 1000 }
    )

    const result = await readFile(outputPath)
    if (!result.length) {
      throw new Error('ffmpeg selesai tapi hasilnya kosong')
    }

    return { data: result, mimetype: target.mimetype, fileName: `converted.${target.ext}` }
  } finally {
    await unlink(inputPath).catch(() => {})
    await unlink(outputPath).catch(() => {})
  }
}

export default {
  name: 'converter',
  command: ['convert', 'converter', 'conv', 'cv'],
  allow: CHAT.BOTH,
  roleRequired: 10,
  category: 'tools',
  description: 'Convert images, audio, and video to other formats',

  async handle(ctx) {
    const { sock, chat, msg } = ctx
    const requested = ctx.args?.[0]

    if (!requested) {
      const { images, media } = formatSummary()
      await sock.sendMessage(chat, {
        text: [
          `*Converter Media*`,
          '',
          `Balas media dengan perintah lalu format tujuan:`,
          `  ${ctx.prefix}convert <format>`,
          '',
          `*Gambar* (langsung, tanpa ffmpeg)`,
          `  ${images}`,
          '',
          `*Audio / Video* (pakai ffmpeg)`,
          `  ${media}`,
          '',
          `Contoh: balas foto, lalu ${ctx.prefix}convert png`
        ].join('\n'),
        quoted: msg
      })
      return
    }

    const target = normalizeFormat(requested)
    if (!target) {
      const { images, media } = formatSummary()
      await sock.sendMessage(chat, {
        text: [
          `*${requested}* bukan format yang didukung.`,
          '',
          `*Gambar*: ${images}`,
          `*Audio / Video*: ${media}`
        ].join('\n'),
        quoted: msg
      })
      return
    }

    await sock.sendMessage(chat, { react: { text: '⏳', key: msg.key } })

    try {
      const source = await extractSource(ctx)
      const result = await convertBuffer({
        data: source.buffer,
        sourceExt: source.ext,
        target
      })

      await sock.sendMessage(chat, {
        document: result.data,
        mimetype: result.mimetype,
        fileName: result.fileName,
        caption: `*${source.label} → ${target.toUpperCase()}*`,
        quoted: msg
      })

      await sock.sendMessage(chat, { react: { text: '✅', key: msg.key } })
    } catch (error) {
      logger.error('[converter] gagal konversi', error)

      await sock.sendMessage(chat, {
        text: `❌ Gagal konversi: ${friendlyError(error)}`,
        quoted: msg
      })
      await sock.sendMessage(chat, { react: { text: '❌', key: msg.key } })
    }
  }
}

function friendlyError(error) {
  const raw = String(error?.message || error)

  const cleaned = raw
    .replace(/Command failed:[\s\S]*/i, 'Proses konversi berhenti')
    .replace(/\/[\w./-]+/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

  return cleaned.length > 200 ? `${cleaned.slice(0, 197)}...` : cleaned
}

async function extractSource(ctx) {
  const quoted = ctx.msg.message?.extendedTextMessage?.contextInfo

  if (quoted?.quotedMessage) {
    const qm = quoted.quotedMessage
    const content = pickContent(qm)
    if (content) {
      const targetMsg = {
        key: {
          remoteJid: ctx.chat,
          fromMe: false,
          id: quoted.stanzaId,
          participant: quoted.participant
        },
        message: qm
      }
      const buffer = await downloadMediaMessage(targetMsg, 'buffer', {}, { logger: { level: 'silent' } })
      return finish(buffer, content, ctx)
    }
  }

  const content = pickContent(ctx.msg.message)
  if (content) {
    const buffer = await downloadMediaMessage(ctx.msg, 'buffer', {}, { logger: { level: 'silent' } })
    return finish(buffer, content, ctx)
  }

  throw new Error('Balas sebuah gambar, video, audio, atau dokumen, lalu ulangi perintah.')
}

function pickContent(message) {
  if (!message) return null

  if (message.imageMessage) {
    return { type: 'image', mimetype: message.imageMessage.mimetype || 'image/jpeg', fileName: 'image.jpg' }
  }
  if (message.videoMessage) {
    return {
      type: 'video',
      mimetype: message.videoMessage.mimetype || 'video/mp4',
      fileName: message.videoMessage.fileName || 'video.mp4'
    }
  }
  if (message.audioMessage) {
    return {
      type: 'audio',
      mimetype: message.audioMessage.mimetype || 'audio/mpeg',
      fileName: 'audio.mp3'
    }
  }
  if (message.documentMessage) {
    const doc = message.documentMessage
    const name = doc.fileName || 'file'
    return {
      type: 'document',
      mimetype: doc.mimetype || 'application/octet-stream',
      fileName: name
    }
  }
  if (message.stickerMessage) {
    return { type: 'image', mimetype: 'image/webp', fileName: 'sticker.webp' }
  }
  return null
}

function finish(buffer, content, ctx) {
  if (!buffer || !buffer.length) {
    throw new Error('Media gagal diunduh. Coba lagi dengan file yang lebih kecil.')
  }
  if (buffer.length > MAX_BYTES) {
    throw new Error(
      `File ${formatSize(buffer.length)} melebihi batas ${formatSize(MAX_BYTES)}.`
    )
  }

  const ext = (content.fileName || '').split('.').pop()?.toLowerCase() || extFromMime(content.mimetype)
  return {
    buffer,
    ext,
    label: `${content.type}: ${content.fileName}`
  }
}

function extFromMime(mimetype) {
  const map = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
    'audio/mpeg': 'mp3',
    'audio/mp4': 'm4a',
    'audio/ogg': 'ogg'
  }
  return map[mimetype] || 'bin'
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

export const __test = { convertBuffer, convertImage, convertMedia, pickContent, formatSize, friendlyError }