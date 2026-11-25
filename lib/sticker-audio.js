'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFile } = require('child_process')
const { promisify } = require('util')

const run = promisify(execFile)

function ffmpegPath () {
  if (global.FFMPEG_PATH) return global.FFMPEG_PATH
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH
  try { return require('ffmpeg-static') } catch (e) {}
  try { return require('@ffmpeg-installer/ffmpeg').path } catch (e) {}
  return 'ffmpeg'
}

async function extractSoundStickerMedia (video) {
  if (!Buffer.isBuffer(video) || !video.length) throw new Error('Video kosong')

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stcaudio-'))
  const input = path.join(dir, 'source.mp4')
  const image = path.join(dir, 'sticker.webp')
  const audio = path.join(dir, 'sticker.ogg')
  fs.writeFileSync(input, video)

  try {
    const bin = ffmpegPath()
    const options = { maxBuffer: 8 * 1024 * 1024 }
    await Promise.all([
      run(bin, ['-y', '-loglevel', 'error', '-i', input, '-map', '0:v:0', '-frames:v', '1', '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000', '-c:v', 'libwebp', '-q:v', '80', '-f', 'webp', image], options),
      run(bin, ['-y', '-loglevel', 'error', '-i', input, '-map', '0:a:0', '-vn', '-ac', '1', '-ar', '48000', '-c:a', 'libopus', '-b:a', '64k', '-t', '29', '-f', 'ogg', audio], options)
    ])

    const imageBuffer = fs.readFileSync(image)
    const audioBuffer = fs.readFileSync(audio)
    if (!imageBuffer.length || !audioBuffer.length) throw new Error('Hasil konversi kosong')

    return { image: imageBuffer, audio: audioBuffer }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

async function sendSoundSticker (conn, jid, media, quoted, options = {}) {
  const stickerOptions = options.stickerOptions || {}
  try {
    const response = await conn.sendMessage(jid, {
      sticker: media.image,
      stickerAudio: media.audio,
      ...stickerOptions
    }, { quoted })
    return { response, fallback: false }
  } catch (error) {
    if (options.fallback === false) throw error
    const response = await conn.sendMessage(jid, {
      sticker: media.image,
      ...stickerOptions
    }, { quoted })
    return { response, fallback: true, error }
  }
}

module.exports = { extractSoundStickerMedia, sendSoundSticker, ffmpegPath }
