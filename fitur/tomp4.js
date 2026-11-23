// Plugin: tomp4
// Commands: tomp4, stickertomp4, stktomp4
// Fix: support animated webp (ANIM/ANMF) + auto detect static/animated

'use strict'

const fs        = require('fs')
const path      = require('path')
const { exec }  = require('child_process')
const { promisify } = require('util')
const execAsync = promisify(exec)

function getFfmpegPath() {
  try { return require('ffmpeg-static') } catch { return 'ffmpeg' }
}
const FFMPEG = getFfmpegPath()

function isAnimatedWebp(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return false
  const isWebP = buffer.slice(0, 4).toString('ascii') === 'RIFF' &&
                 buffer.slice(8, 12).toString('ascii') === 'WEBP'
  return isWebP && buffer.indexOf(Buffer.from('ANIM')) !== -1
}

async function animatedWebpToMp4(inputPath, outputPath) {
  await execAsync(
    `"${FFMPEG}" -y -ignore_loop 0 -analyzeduration 10000000 -probesize 10000000 ` +
    `-i "${inputPath}" ` +
    `-vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black@0" ` +
    `-c:v libx264 -preset fast -crf 28 -pix_fmt yuv420p -movflags +faststart -an "${outputPath}"`,
    { timeout: 90000 }
  )
}

async function staticWebpToMp4(inputPath, outputPath) {
  await execAsync(
    `"${FFMPEG}" -y -loop 1 -i "${inputPath}" ` +
    `-vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black@0" ` +
    `-c:v libx264 -preset fast -crf 28 -pix_fmt yuv420p -movflags +faststart -an -t 2 "${outputPath}"`,
    { timeout: 60000 }
  )
}

async function webpToMp4(inputPath, outputPath) {
  const buffer = fs.readFileSync(inputPath)
  if (isAnimatedWebp(buffer)) await animatedWebpToMp4(inputPath, outputPath)
  else await staticWebpToMp4(inputPath, outputPath)
}

async function videoToMp4(inputPath, outputPath) {
  await execAsync(
    `"${FFMPEG}" -y -i "${inputPath}" -c:v libx264 -c:a aac -pix_fmt yuv420p -movflags +faststart "${outputPath}"`,
    { timeout: 120000 }
  )
}

module.exports = {
  command: ['tomp4', 'stickertomp4', 'stktomp4'],
  tags: ['converter'],
  run: async (alya, m, ctx) => {
    const { prefix, command, quoted, mime, replyalya, replytolak } = ctx

    if (!quoted) {
      return replytolak(
        `🎬 *Converter ke MP4*\n\nReply stiker animasi atau video dengan perintah *${prefix + command}*\n\nMendukung: *stiker webp animasi*, *video mp4*, *video 3gp*`
      )
    }

    const qMime    = quoted.mimetype || mime || ''
    const isSticker = /webp/.test(qMime) || m.mtype === 'stickerMessage'
    const isVideo   = /video/.test(qMime)

    if (!isSticker && !isVideo) return replytolak('❌ Harus reply *stiker animasi* atau *video*!')

    await alya.sendMessage(m.chat, { react: { text: '⌛', key: m.key } })
    replyalya('⏳ *Sedang mengkonversi ke MP4...*\nMohon tunggu sebentar 🎬')

    const ts     = Date.now()
    const tmpIn  = path.join('/tmp', `alya_tomp4_in_${ts}${isSticker ? '.webp' : '.mp4'}`)
    const tmpOut = path.join('/tmp', `alya_tomp4_out_${ts}.mp4`)

    try {
      const buffer = await quoted.download()
      fs.writeFileSync(tmpIn, buffer)

      if (isSticker) await webpToMp4(tmpIn, tmpOut)
      else await videoToMp4(tmpIn, tmpOut)

      const stat = fs.statSync(tmpOut)
      if (stat.size < 100) throw new Error('Output mp4 kosong, konversi gagal.')

      await alya.sendMessage(m.chat, {
        video: fs.readFileSync(tmpOut),
        caption:
          `✅ *Konversi Berhasil!*\n\n` +
          `🎬 Format : *MP4*\n` +
          `📦 Source : *${isSticker ? 'Stiker Animasi WebP' : 'Video'}*\n` +
          `📏 Size   : *${(stat.size / 1024).toFixed(1)} KB*`
      }, { quoted: m })

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (err) {
      console.error('[tomp4]', err.message)
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      const hint = /timeout/i.test(err.message)
        ? '_Konversi timeout, coba file lebih kecil._'
        : `_${err.message}_`
      replyalya(`❌ *Gagal konversi!*\n\n${hint}\n\n_Pastikan ffmpeg terinstall atau coba lagi nanti_`)
    } finally {
      try { if (fs.existsSync(tmpIn))  fs.unlinkSync(tmpIn)  } catch {}
      try { if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut) } catch {}
    }
  }
}
