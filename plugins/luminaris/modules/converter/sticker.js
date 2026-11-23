import { CHAT } from '../../_runtime/core-shim.js'
import { logger, config } from '../../_runtime/core-shim.js'
import { downloadMediaMessage } from '@whiskeysockets/baileys'
import sharp from 'sharp'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { writeFile, unlink, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { randomBytes } from 'node:crypto'

const execFileAsync = promisify(execFile)

const TMP = tmpdir()
const STICKER_SIZE = 512
const STICKER_PACK_ID = `com.${String(config.botName || 'whatsapp-bot').toLowerCase().replace(/[^a-z0-9]+/g, '') || 'whatsappbot'}.sticker`

const MEDIA_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'video/mp4': '.mp4',
  'video/webm': '.webm'
}

const ANIMATED_MIMES = new Set([
  'image/gif',
  'video/mp4',
  'video/webm'
])

export default {
  name: 'sticker',
  command: ['sticker', 'stiker', 's', 'toimg', 'stickerto', 'colongsticker', 'colong', 'stickermeme', 'smeme'],
  allow: CHAT.BOTH,
  roleRequired: 10,
  category: 'tools',
  description: 'Convert media to sticker, sticker to media, edit metadata, and sticker meme.',

  async handle(ctx) {
    const trigger = ctx.trigger.toLowerCase()

    switch (trigger) {
      case 'sticker':
      case 'stiker':
      case 's':
        return handleMediaToSticker(ctx)
      case 'toimg':
        return handleStickerToMedia(ctx, 'png')
      case 'stickerto':
        return handleStickerToMedia(ctx, ctx.args[0]?.toLowerCase())
      case 'colongsticker':
      case 'colong':
        return handleColongSticker(ctx)
      case 'stickermeme':
      case 'smeme':
        return handleStickerMeme(ctx)
      default:
        return ctx.sock.sendMessage(ctx.chat, {
          text: `Use:\n- ${ctx.prefix}s — sticker from media\n- ${ctx.prefix}toimg — sticker to image\n- ${ctx.prefix}stickerto gif/mp4 — sticker to other format\n- ${ctx.prefix}colong <pack> <author> — edit sticker metadata\n- ${ctx.prefix}smeme <top text | bottom text> — sticker meme`,
          quoted: ctx.msg
        })
    }
  }
}

async function handleMediaToSticker(ctx) {
  try {
    await ctx.sock.sendMessage(ctx.chat, { react: { text: '⏳', key: ctx.msg.key } })

    const { buffer: mediaBuffer, mimetype } = await extractMedia(ctx)
    if (!mediaBuffer || mediaBuffer.length === 0) {
      throw new Error('Failed to download media. Ensure media is attached or reply to valid media.')
    }

    const isAnimated = ANIMATED_MIMES.has(mimetype) ||
      (mimetype === 'image/webp' && await isAnimatedWebP(mediaBuffer))

    let stickerBuffer
    if (isAnimated) {
      stickerBuffer = await convertAnimatedToSticker(mediaBuffer, mimetype)
    } else {
      stickerBuffer = await convertStaticToSticker(mediaBuffer)
    }

    await ctx.sock.sendMessage(ctx.chat, {
      sticker: stickerBuffer,
      mimetype: 'image/webp',
      packname: config.botName,
      author: 'Bot'
    })

    await ctx.sock.sendMessage(ctx.chat, { react: { text: '✅', key: ctx.msg.key } })
  } catch (error) {
    logger.error('sticker-to error', error)
    await ctx.sock.sendMessage(ctx.chat, {
      text: `❌ Failed to create sticker: ${error.message}`,
      quoted: ctx.msg
    })
    await ctx.sock.sendMessage(ctx.chat, { react: { text: '❌', key: ctx.msg.key } })
  }
}

async function handleStickerToMedia(ctx, format) {
  try {
    await ctx.sock.sendMessage(ctx.chat, { react: { text: '⏳', key: ctx.msg.key } })

    const targetFmt = (format || 'png').toLowerCase()

    const quoted = ctx.msg.message?.extendedTextMessage?.contextInfo
    let stickerMsg = null

    if (quoted?.quotedMessage?.stickerMessage) {
      stickerMsg = {
        key: {
          remoteJid: ctx.chat,
          fromMe: false,
          id: quoted.stanzaId,
          participant: quoted.participant
        },
        message: quoted.quotedMessage
      }
    } else if (ctx.msg.message?.stickerMessage) {
      stickerMsg = ctx.msg
    } else {
      throw new Error('Reply to a sticker or send a sticker with this command.')
    }

    const buffer = await downloadMediaMessage(stickerMsg, 'buffer', {}, { logger: { level: 'silent' } })
    if (!buffer || buffer.length === 0) {
      throw new Error('Failed to download sticker.')
    }

    const isAnimated = stickerMsg.message?.stickerMessage?.isAnimated || await isAnimatedWebP(buffer)

    if (isAnimated) {
      const outPath = join(TMP, `stk_${randomBytes(4).toString('hex')}.${targetFmt === 'mp4' ? 'mp4' : 'gif'}`)

      if (targetFmt === 'mp4') {
        await execFileAsync('ffmpeg', [
          '-y', '-i', 'pipe:0',
          '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000',
          '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-movflags', '+faststart',
          outPath
        ], { input: buffer, maxBuffer: 50 * 1024 * 1024 })

        const result = await readFile(outPath)
        await ctx.sock.sendMessage(ctx.chat, {
          video: result,
          mimetype: 'video/mp4',
          caption: 'Sticker → MP4'
        })
      } else {
        await execFileAsync('ffmpeg', [
          '-y', '-i', 'pipe:0',
          '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000',
          '-loop', '0', '-fs', '10M',
          outPath
        ], { input: buffer, maxBuffer: 50 * 1024 * 1024 })

        const result = await readFile(outPath)
        await ctx.sock.sendMessage(ctx.chat, {
          document: result,
          mimetype: 'image/gif',
          fileName: 'sticker.gif',
          caption: 'Sticker → GIF'
        })
      }

      await unlink(outPath).catch(() => {})
    } else {
      const pngBuffer = await sharp(buffer)
        .resize(STICKER_SIZE, STICKER_SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()

      await ctx.sock.sendMessage(ctx.chat, {
        image: pngBuffer,
        mimetype: 'image/png',
        caption: 'Sticker → PNG'
      })
    }

    await ctx.sock.sendMessage(ctx.chat, { react: { text: '✅', key: ctx.msg.key } })
  } catch (error) {
    logger.error('sticker-to-media error', error)
    await ctx.sock.sendMessage(ctx.chat, {
      text: `❌ Failed: ${error.message}`,
      quoted: ctx.msg
    })
    await ctx.sock.sendMessage(ctx.chat, { react: { text: '❌', key: ctx.msg.key } })
  }
}

async function handleColongSticker(ctx) {
  try {
    await ctx.sock.sendMessage(ctx.chat, { react: { text: '⏳', key: ctx.msg.key } })

    const quoted = ctx.msg.message?.extendedTextMessage?.contextInfo
    let stickerMsg = null

    if (quoted?.quotedMessage?.stickerMessage) {
      stickerMsg = {
        key: {
          remoteJid: ctx.chat,
          fromMe: false,
          id: quoted.stanzaId,
          participant: quoted.participant
        },
        message: quoted.quotedMessage
      }
    } else if (ctx.msg.message?.stickerMessage) {
      stickerMsg = ctx.msg
    } else {
      throw new Error('Reply to a sticker or send a sticker with this command.')
    }

    let packName = config.botName
    let authorName = 'Bot'

    if (ctx.args.length > 0) {
      const rawArgs = getRawArgs(ctx)
      const packMatch = rawArgs.match(/pack=([^\s]+)/i)
      const authorMatch = rawArgs.match(/author=([^\s]+)/i)

      if (packMatch) {
        packName = packMatch[1]
        if (authorMatch) authorName = authorMatch[1]
      } else if (ctx.args.length >= 2) {
        packName = ctx.args[0]
        authorName = ctx.args[1]
      } else {
        packName = ctx.args[0]
      }
    }

    if (!packName || packName.length === 0) {
      throw new Error(
        'Format: !colong <pack> <author>\n' +
        'Example: !colong MyPack MyAuthor\n' +
        'Or: !colong pack=NamaPack author=NamaAuthor'
      )
    }

    const buffer = await downloadMediaMessage(stickerMsg, 'buffer', {}, { logger: { level: 'silent' } })
    if (!buffer || buffer.length === 0) {
      throw new Error('Failed to download sticker.')
    }

    if (buffer.length > 1024 * 1024) {
      throw new Error('Sticker is too large (max 1MB).')
    }

    const isAnimated = stickerMsg.message?.stickerMessage?.isAnimated || await isAnimatedWebP(buffer)
    if (isAnimated) {
      throw new Error('Animated stickers are not yet supported for metadata editing.')
    }

    if (packName.length > 50) packName = packName.slice(0, 50)
    if (authorName.length > 50) authorName = authorName.slice(0, 50)

    const metadata = {
      'sticker-pack-id': STICKER_PACK_ID,
      'sticker-pack-name': packName,
      'sticker-pack-publisher': authorName,
      'emojis': []
    }

    const exifBuffer = buildExifBuffer(metadata)
    const modified = await sharp(buffer)
      .withExifMerge({ IFD0: { ImageDescription: JSON.stringify(metadata) } })
      .webp({ quality: 80 })
      .toBuffer()

    const exifInjected = injectExif(modified, exifBuffer)

    await ctx.sock.sendMessage(ctx.chat, {
      sticker: exifInjected,
      mimetype: 'image/webp',
      packname: packName,
      author: authorName
    })

    await ctx.sock.sendMessage(ctx.chat, {
      text: `Sticker metadata updated:\nPack: ${packName}\nAuthor: ${authorName}`,
      quoted: ctx.msg
    })

    await ctx.sock.sendMessage(ctx.chat, { react: { text: '✅', key: ctx.msg.key } })
  } catch (error) {
    logger.error('colongsticker error', error)
    await ctx.sock.sendMessage(ctx.chat, {
      text: `❌ Failed: ${error.message}`,
      quoted: ctx.msg
    })
    await ctx.sock.sendMessage(ctx.chat, { react: { text: '❌', key: ctx.msg.key } })
  }
}

async function handleStickerMeme(ctx) {
  try {
    await ctx.sock.sendMessage(ctx.chat, { react: { text: '⏳', key: ctx.msg.key } })

    const { buffer: mediaBuffer, mimetype, isAnimated: isSourceAnimated } = await extractMedia(ctx)

    const rawArgs = getRawArgs(ctx)
    let topText = ''
    let bottomText = ''

    if (rawArgs.includes('|')) {
      const parts = rawArgs.split('|')
      topText = cleanTextForFFmpeg(parts[0].trim())
      bottomText = cleanTextForFFmpeg(parts.slice(1).join('|').trim())
    } else {
      topText = cleanTextForFFmpeg(rawArgs)
    }

    if (!topText && !bottomText) {
      throw new Error(
        'Please provide text for the meme.\n' +
        'Format: !smeme <top text | bottom text>\n' +
        'Example: !smeme MENDING | TURU'
      )
    }

    const isAnimated = isSourceAnimated || (mimetype === 'image/webp' && await isAnimatedWebP(mediaBuffer))
    const tmpId = randomBytes(4).toString('hex')
    const inputPath = join(TMP, `meme_in_${tmpId}${isAnimated ? '.webp' : '.png'}`)
    const outputPath = join(TMP, `meme_out_${tmpId}.webp`)

    try {
      let inputBuffer
      if (isAnimated) {
        inputBuffer = mediaBuffer
      } else {
        inputBuffer = await sharp(mediaBuffer)
          .resize(STICKER_SIZE, STICKER_SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer()
      }

      await writeFile(inputPath, inputBuffer)

      const filters = []
      if (topText) {
        filters.push(
          `drawtext=text='${topText}':fontsize=42:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=30`
        )
      }
      if (bottomText) {
        filters.push(
          `drawtext=text='${bottomText}':fontsize=42:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h-text_h-30`
        )
      }

      const filterStr = filters.join(',')

      // REMOVED '-vsync', '0' as it is deprecated in FFmpeg 6.0+ and causes crashes
      await execFileAsync('ffmpeg', [
        '-y', '-i', inputPath,
        '-vf', filterStr,
        '-vcodec', 'libwebp',
        '-lossless', '0',
        '-compression_level', '6',
        '-q:v', '80',
        '-loop', '0',
        '-preset', 'default',
        '-an',
        outputPath
      ], { maxBuffer: 50 * 1024 * 1024 })

      const result = await readFile(outputPath)

      await ctx.sock.sendMessage(ctx.chat, {
        sticker: result,
        mimetype: 'image/webp',
        packname: config.botName,
        author: 'Meme'
      })

      await ctx.sock.sendMessage(ctx.chat, { react: { text: '✅', key: ctx.msg.key } })
    } finally {
      await unlink(inputPath).catch(() => {})
      await unlink(outputPath).catch(() => {})
    }
  } catch (error) {
    logger.error('stickermeme error', error)
    await ctx.sock.sendMessage(ctx.chat, {
      text: `❌ Failed: ${error.message}`,
      quoted: ctx.msg
    })
    await ctx.sock.sendMessage(ctx.chat, { react: { text: '❌', key: ctx.msg.key } })
  }
}


function getRawArgs(ctx) {
  const rawText = ctx.msg.message?.conversation ||
    ctx.msg.message?.extendedTextMessage?.text ||
    ctx.msg.message?.imageMessage?.caption ||
    ctx.msg.message?.videoMessage?.caption || ''
  const prefixChar = ctx.prefix || '!'
  const regex = new RegExp(`^[${prefixChar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]${ctx.trigger}\\s*`, 'i')
  return rawText.replace(regex, '').trim()
}

async function extractMedia(ctx) {
  const quoted = ctx.msg.message?.extendedTextMessage?.contextInfo

  if (quoted?.quotedMessage) {
    const qm = quoted.quotedMessage
    if (qm.imageMessage || qm.videoMessage || qm.stickerMessage) {
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
      const msgContent = qm.imageMessage || qm.videoMessage || qm.stickerMessage
      return {
        buffer,
        mimetype: msgContent.mimetype || (qm.imageMessage ? 'image/jpeg' : 'video/mp4'),
        isAnimated: false
      }
    }
  }

  const msg = ctx.msg.message
  if (msg?.imageMessage) {
    const buffer = await downloadMediaMessage(ctx.msg, 'buffer', {}, { logger: { level: 'silent' } })
    return { buffer, mimetype: msg.imageMessage.mimetype || 'image/jpeg', isAnimated: false }
  }
  if (msg?.videoMessage) {
    const buffer = await downloadMediaMessage(ctx.msg, 'buffer', {}, { logger: { level: 'silent' } })
    return { buffer, mimetype: msg.videoMessage.mimetype || 'video/mp4', isAnimated: true }
  }
  if (msg?.stickerMessage) {
    const buffer = await downloadMediaMessage(ctx.msg, 'buffer', {}, { logger: { level: 'silent' } })
    return { buffer, mimetype: 'image/webp', isAnimated: msg.stickerMessage.isAnimated || false }
  }

  throw new Error('No media found. Reply to or attach an image/video/sticker.')
}

async function isAnimatedWebP(buffer) {
  try {
    const metadata = await sharp(buffer, { animated: true }).metadata()
    return metadata.pages != null && metadata.pages > 1
  } catch {
    return false
  }
}

async function convertStaticToSticker(buffer) {
  return sharp(buffer)
    .resize(STICKER_SIZE, STICKER_SIZE, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .webp({ quality: 80 })
    .toBuffer()
}

async function convertAnimatedToSticker(buffer, mimetype) {
  const tmpId = randomBytes(4).toString('hex')
  const ext = MEDIA_MIME[mimetype] || '.mp4'
  const inputPath = join(TMP, `stk_anim_in_${tmpId}${ext}`)
  const outputPath = join(TMP, `stk_anim_out_${tmpId}.webp`)

  try {
    await writeFile(inputPath, buffer)

    await execFileAsync('ffmpeg', [
      '-y', '-i', inputPath,
      '-vf', `scale=${STICKER_SIZE}:${STICKER_SIZE}:force_original_aspect_ratio=decrease,pad=${STICKER_SIZE}:${STICKER_SIZE}:(ow-iw)/2:(oh-ih)/2:color=0x00000000`,
      '-vcodec', 'libwebp',
      '-lossless', '0',
      '-compression_level', '6',
      '-q:v', '80',
      '-loop', '0',
      '-preset', 'default',
      '-an',
      '-fs', '1M',
      outputPath
    ], { maxBuffer: 50 * 1024 * 1024 })

    const result = await readFile(outputPath)
    return result
  } finally {
    await unlink(inputPath).catch(() => {})
    await unlink(outputPath).catch(() => {})
  }
}

function buildExifBuffer(metadata) {
  const json = JSON.stringify(metadata)
  const jsonBuf = Buffer.from(json, 'utf8')
  const padding = (jsonBuf.length + 1) % 2 === 0 ? 1 : 2

  const exifData = Buffer.alloc(6 + jsonBuf.length + padding)
  exifData.write('Exif\0\0', 0, 'ascii')
  jsonBuf.copy(exifData, 6)

  const tiffHeader = Buffer.alloc(8)
  tiffHeader.write('II', 0, 'ascii')
  tiffHeader.writeUInt16LE(0x002A, 2)
  tiffHeader.writeUInt32LE(8, 4)

  const tagCount = 2
  const ifdDir = Buffer.alloc(2 + tagCount * 12 + 4)
  ifdDir.writeUInt16LE(tagCount, 0)

  ifdDir.writeUInt16LE(0x0100, 2)
  ifdDir.writeUInt16LE(0x0003, 4)
  ifdDir.writeUInt32LE(1, 6)
  ifdDir.writeUInt16LE(512, 10)
  ifdDir.writeUInt16LE(0, 12)

  ifdDir.writeUInt16LE(0x0101, 14)
  ifdDir.writeUInt16LE(0x0003, 16)
  ifdDir.writeUInt32LE(1, 18)
  ifdDir.writeUInt16LE(512, 22)
  ifdDir.writeUInt16LE(0, 24)

  ifdDir.writeUInt32LE(0, 26)

  return Buffer.concat([tiffHeader, ifdDir, exifData])
}

function injectExif(webpBuffer, exifChunkData) {
  const vp8xIdx = findSignature(webpBuffer, Buffer.from('VP8X'))
  if (vp8xIdx === -1) return webpBuffer

  const chunkLenOffset = vp8xIdx + 4
  const vp8xChunkLen = webpBuffer.readUInt32LE(chunkLenOffset)
  const afterVp8x = vp8xIdx + 8 + vp8xChunkLen

  const flagsOffset = vp8xIdx + 8
  const flags = webpBuffer.readUInt32LE(flagsOffset)
  webpBuffer.writeUInt32LE(flags | (1 << 24), flagsOffset)

  const exifChunkHeader = Buffer.alloc(8)
  exifChunkHeader.write('EXIF', 0)
  exifChunkHeader.writeUInt32LE(exifChunkData.length, 4)

  const result = Buffer.alloc(webpBuffer.length + 8 + exifChunkData.length)
  webpBuffer.copy(result, 0, 0, afterVp8x)
  exifChunkHeader.copy(result, afterVp8x)
  exifChunkData.copy(result, afterVp8x + 8)
  webpBuffer.copy(result, afterVp8x + 8 + exifChunkData.length, afterVp8x)

  return result
}

function findSignature(buffer, sig) {
  for (let i = 0; i <= buffer.length - sig.length; i++) {
    if (buffer.subarray(i, i + sig.length).equals(sig)) return i
  }
  return -1
}

function cleanTextForFFmpeg(text) {
  return text
    .replace(/\\/g, '')
    .replace(/'/g, '')
    .replace(/%/g, '')
    .replace(/:/g, '')
    .replace(/;/g, '')
    .replace(/\|/g, '')
    .replace(/\n/g, ' ')
    .trim()
}