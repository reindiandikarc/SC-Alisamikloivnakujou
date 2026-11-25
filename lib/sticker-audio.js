'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFile } = require('child_process')
const { promisify } = require('util')
const { generateWAMessageFromContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys')

const run = promisify(execFile)
const EXIF_HEADER = Buffer.from([
  0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
  0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x16, 0x00, 0x00, 0x00
])
const VP8X_EXIF_FLAG = 0x08
const WEBP_LADDER = [
  [512, 60, 15],
  [384, 60, 15],
  [320, 60, 15],
  [384, 45, 12],
  [320, 45, 12],
  [256, 45, 10]
]

function ffmpegPath () {
  if (global.FFMPEG_PATH) return global.FFMPEG_PATH
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH
  try { return require('ffmpeg-static') } catch (e) {}
  try { return require('@ffmpeg-installer/ffmpeg').path } catch (e) {}
  return 'ffmpeg'
}

function buildStickerExif (options = {}) {
  const metadata = {
    'sticker-pack-id': options.packId || 'com.whatsapp.soundsticker',
    'sticker-pack-name': options.pack || '',
    'sticker-pack-publisher': options.author || '',
    emojis: options.emojis || ['']
  }
  const json = Buffer.from(JSON.stringify(metadata), 'utf8')
  const header = Buffer.from(EXIF_HEADER)
  header.writeUInt32LE(json.length, 14)
  return Buffer.concat([header, json])
}

function buildRiffChunk (fourcc, payload) {
  const header = Buffer.alloc(8)
  header.write(fourcc, 0, 4, 'ascii')
  header.writeUInt32LE(payload.length, 4)
  const pad = payload.length % 2 === 1 ? Buffer.from([0x00]) : Buffer.alloc(0)
  return Buffer.concat([header, payload, pad])
}

function buildVp8xChunk (options = {}) {
  const payload = Buffer.alloc(10)
  let flags = 0
  if (options.hasExif !== false) flags |= VP8X_EXIF_FLAG
  if (options.hasAlpha) flags |= 0x10
  if (options.hasAnim) flags |= 0x02
  payload[0] = flags
  payload.writeUIntLE(Math.max(1, options.width || 512) - 1, 4, 3)
  payload.writeUIntLE(Math.max(1, options.height || 512) - 1, 7, 3)
  return buildRiffChunk('VP8X', payload)
}

function injectWebpExif (webp, exif, options = {}) {
  if (!Buffer.isBuffer(webp) || webp.length < 12 || webp.toString('ascii', 0, 4) !== 'RIFF' || webp.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error('WebP tidak valid')
  }
  const chunks = []
  let hasVp8x = false
  let hasAlpha = false
  let hasAnim = false
  let offset = 12
  while (offset + 8 <= webp.length) {
    const fourcc = webp.toString('ascii', offset, offset + 4)
    const size = webp.readUInt32LE(offset + 4)
    const dataStart = offset + 8
    const dataEnd = dataStart + size
    if (dataEnd > webp.length) throw new Error('Chunk WebP terpotong: ' + fourcc)
    const paddedEnd = dataEnd + (size % 2)
    if (fourcc !== 'EXIF') {
      const payload = Buffer.from(webp.subarray(dataStart, dataEnd))
      if (fourcc === 'VP8X') {
        if (payload.length < 10) throw new Error('VP8X tidak valid')
        payload[0] |= VP8X_EXIF_FLAG
        hasVp8x = true
      } else if (fourcc === 'ALPH') {
        hasAlpha = true
      } else if (fourcc === 'ANIM') {
        hasAnim = true
      }
      chunks.push(buildRiffChunk(fourcc, payload))
    }
    offset = paddedEnd
  }
  if (!hasVp8x) chunks.unshift(buildVp8xChunk({ width: options.width, height: options.height, hasAlpha, hasAnim, hasExif: true }))
  chunks.push(buildRiffChunk('EXIF', exif))
  const body = Buffer.concat(chunks)
  const header = Buffer.alloc(12)
  header.write('RIFF', 0, 4, 'ascii')
  header.writeUInt32LE(4 + body.length, 4)
  header.write('WEBP', 8, 4, 'ascii')
  return Buffer.concat([header, body])
}

async function videoToAnimatedWebp (input, output, options = {}) {
  const ffmpegBin = options.ffmpegBin || ffmpegPath()
  const execOptions = { maxBuffer: 8 * 1024 * 1024, timeout: 120000 }
  const trim = options.maxSeconds > 0 ? ['-t', String(options.maxSeconds)] : []
  for (const [size, quality, fps] of WEBP_LADDER) {
    await run(ffmpegBin, [
      '-y', '-loglevel', 'error',
      '-i', input,
      ...trim,
      '-vf', `fps=${fps},scale=${size}:${size}:force_original_aspect_ratio=increase,crop=${size}:${size}`,
      '-loop', '0',
      '-c:v', 'libwebp_anim',
      '-lossless', '0',
      '-q:v', String(quality),
      '-preset', 'default',
      '-an',
      output
    ], execOptions)
    const raw = fs.readFileSync(output)
    const stamped = options.exifPayload ? injectWebpExif(raw, options.exifPayload, { width: size, height: size }) : raw
    if (stamped.length <= (options.maxBytes || 1000000)) return { buffer: stamped, size, quality, fps }
  }
  throw new Error('WebP animasi tetap melebihi batas ukuran')
}

async function videoToStickerOpus (input, output, options = {}) {
  const ffmpegBin = options.ffmpegBin || ffmpegPath()
  const execOptions = { maxBuffer: 8 * 1024 * 1024, timeout: 120000 }
  const intermediate = `${output}.step1.ogg`
  const trim = options.maxSeconds > 0 ? ['-t', String(options.maxSeconds)] : []
  try {
    await run(ffmpegBin, [
      '-y', '-loglevel', 'error',
      '-i', input,
      '-vn',
      ...trim,
      '-c:a', 'libopus',
      '-b:a', '64k',
      intermediate
    ], execOptions)
    await run(ffmpegBin, [
      '-y', '-loglevel', 'error',
      '-i', intermediate,
      '-ac', '1',
      '-c:a', 'libopus',
      '-b:a', '32k',
      output
    ], execOptions)
    return fs.readFileSync(output)
  } finally {
    fs.rmSync(intermediate, { force: true })
  }
}

async function extractSoundStickerMedia (video, options = {}) {
  if (!Buffer.isBuffer(video) || !video.length) throw new Error('Video kosong')
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stcaudio-'))
  const input = path.join(dir, 'source.mp4')
  const image = path.join(dir, 'sticker.webp')
  const audio = path.join(dir, 'sticker.ogg')
  fs.writeFileSync(input, video)
  try {
    const ffmpegBin = options.ffmpegBin || ffmpegPath()
    const exifPayload = buildStickerExif({
      pack: options.pack || global.packname || 'Alya',
      author: options.author || global.author || 'Alya',
      packId: options.packId || 'com.whatsapp.soundsticker'
    })
    const webp = await videoToAnimatedWebp(input, image, {
      ffmpegBin,
      exifPayload,
      maxSeconds: options.maxVideoSeconds || 10,
      maxBytes: options.maxWebpBytes || 1000000
    })
    let opus = null
    try {
      opus = await videoToStickerOpus(input, audio, {
        ffmpegBin,
        maxSeconds: options.maxAudioSeconds || 9.9
      })
    } catch (e) {
      opus = null
    }
    return { image: webp.buffer, audio: opus, width: webp.size, height: webp.size, animated: true }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

async function prepareSoundStickerMedia (conn, media, options = {}) {
  const logger = options.logger || { debug () {}, info () {}, warn () {}, error () {} }
  const upload = conn.waUploadToServer || options.upload
  if (typeof upload !== 'function') throw new Error('Uploader WhatsApp tidak tersedia')
  const uploadOptions = {
    upload,
    logger,
    mediaCache: options.mediaCache || conn.mediaCache || { get: async () => null, set: async () => {} }
  }
  const sticker = await prepareWAMessageMedia({ sticker: media.image }, uploadOptions)
  const audio = await prepareWAMessageMedia({ audio: media.audio, ptt: true }, uploadOptions)
  const stickerMessage = sticker.stickerMessage
  stickerMessage.isAnimated = true
  stickerMessage.width = media.width || 512
  stickerMessage.height = media.height || 512
  stickerMessage.audioMessage = audio.audioMessage
  return { stickerMessage, audioMessage: audio.audioMessage }
}

function buildSoundStickerMessage (conn, prepared, quoted, options = {}) {
  const stickerMessage = { ...prepared.stickerMessage }
  stickerMessage.audioMessage = prepared.audioMessage
  stickerMessage.isAnimated = true
  stickerMessage.width = prepared.stickerMessage.width || 512
  stickerMessage.height = prepared.stickerMessage.height || 512
  const content = { audioStickerMessage: { message: { stickerMessage } } }
  const userJid = conn.userJid || conn.user?.id
  const waMsg = generateWAMessageFromContent(options.jid || 'jid', content, {
    userJid,
    quoted,
    timestamp: options.timestamp || new Date()
  })
  const wrapper = waMsg.message.audioStickerMessage
  if (wrapper?.contextInfo && stickerMessage.contextInfo === undefined) {
    stickerMessage.contextInfo = wrapper.contextInfo
    delete wrapper.contextInfo
  }
  return waMsg
}

async function sendSoundSticker (conn, jid, media, quoted, options = {}) {
  const stickerOptions = options.stickerOptions || {}
  const sendVisual = async () => {
    const response = await conn.sendMessage(jid, { sticker: media.image, ...stickerOptions }, { quoted })
    return { response, fallback: true }
  }
  if (!media.audio) return sendVisual()
  try {
    const prepared = options.prepared || await prepareSoundStickerMedia(conn, media, options)
    const waMsg = buildSoundStickerMessage(conn, prepared, quoted, { jid })
    const response = await conn.relayMessage(jid, waMsg.message, { messageId: waMsg.key.id })
    return { response, waMsg, fallback: false }
  } catch (error) {
    if (options.fallback === false) throw error
    const response = await sendVisual()
    return { ...response, error }
  }
}

module.exports = {
  extractSoundStickerMedia,
  prepareSoundStickerMedia,
  buildSoundStickerMessage,
  sendSoundSticker,
  ffmpegPath
}
