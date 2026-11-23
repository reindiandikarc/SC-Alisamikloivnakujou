// Plugin: tovid / tomp4
// Commands: tovid, tomp4
// Konversi stiker animated (WebP/WebM) atau video ke MP4

const path = require('path')
const fs   = require('fs')
const axios = require('axios')
const { exec } = require('child_process')

module.exports = {
  command: ["tovid", "tomp4"],
  tags: ['sticker'],
  run: async (alya, m, ctx) => {
    const {
      command, args, text, q, prefix, body, budy,
      sender, from, pushname, botNumber,
      isCmd, isGroup, isMedia, isImage, isVideo, isAudio, isSticker,
      isQuotedImage, isQuotedVideo, isQuotedSticker, isQuotedAudio,
      isQuotedDocument, isQuotedViewOnce, isQuotedLocation, isQuotedContact,
      groupMetadata, groupName, groupMembers, groupAdmins, groupOwner,
      isBotAdmins, isGroupAdmins, isAdmins, isAdminOrOwner,
      Ryuu, isPrem, isAly, isAlya, isSewa, jangan,
      quoted, mime, qmsg, content, type, chatUpdate, store,
      reply, replyalya, replytolak, replyprem,
      senderNumber, chath, pes, messagesC, bady,
      waifuList, husbuList, pler, setting, user
    } = ctx

      // ============================================================
      // ALYA V12 - .tomp4 / .tovid
      // Konversi stiker animated (WebP/WebM) ke video MP4
      // Metode: ffmpeg lokal (webp→mp4, webm→mp4, gif→mp4)
      // ============================================================
      if (!m.quoted) return replyalya('⚠️ Balas stiker animated atau video dulu ya!')

      const _qMtype = m.quoted.mtype || m.quoted.type || ''
      const _qMime  = (m.quoted.msg || m.quoted).mimetype || mime || ''
      const _isSticker = _qMtype === 'stickerMessage' || /sticker/i.test(_qMtype)
      const _isVideo   = /video/.test(_qMime) || /videoMessage/i.test(_qMtype)
      const _isWebp    = /webp/i.test(_qMime)
      const _isWebm    = /webm/i.test(_qMime)
      const _isGif     = /gif/i.test(_qMime)

      if (!_isSticker && !_isVideo && !_isWebp && !_isWebm && !_isGif) {
        return replyalya(
          '⚠️ Yang di-reply harus stiker animated atau video!\n' +
          'Terdeteksi: *' + (_qMtype || 'unknown') + '*\n' +
          'Mimetype: ' + (_qMime || 'kosong')
        )
      }

      await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
      replyalya('⏳ Lagi ngonversi ke MP4, tunggu bentar ya~')

      let _tmpIn = null, _tmpOut = null
      try {
        // 1. Download buffer
        const _buf = await alya.downloadMediaMessage(m.quoted)
        if (!_buf || _buf.length === 0) throw new Error('Gagal download media, buffer kosong')

        // 2. Deteksi format dari magic bytes
        function _detectFmt(buf) {
          if (!buf || buf.length < 12) return 'webp'
          if (buf[0] === 0x1A && buf[1] === 0x45 && buf[2] === 0xDF && buf[3] === 0xA3) return 'webm'
          if (buf.length >= 8 && buf.slice(4, 8).toString('ascii') === 'ftyp') return 'mp4'
          if (buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP') return 'webp'
          if (buf.slice(0, 3).toString('ascii') === 'GIF') return 'gif'
          if (_isSticker || _isWebp) return 'webp'
          if (_isWebm) return 'webm'
          if (_isVideo) return 'mp4'
          return 'webp'
        }

        const _ext = _detectFmt(_buf)
        console.log('[tomp4] ext:', _ext, '| size:', _buf.length, '| mtype:', _qMtype)

        const _tmpDir = path.join(process.cwd(), 'tmp')
        if (!fs.existsSync(_tmpDir)) fs.mkdirSync(_tmpDir, { recursive: true })

        const _ts = Date.now()
        _tmpIn  = path.join(_tmpDir, `tomp4_${_ts}_in.${_ext}`)
        _tmpOut = path.join(_tmpDir, `tomp4_${_ts}_out.mp4`)
        fs.writeFileSync(_tmpIn, _buf)

        let _done = false

        // ── METHOD 1: ffmpeg — command per format ──────────────────
        const _buildCmd = (input, output, fmt) => {
          const base = `ffmpeg -y`
          if (fmt === 'webp') {
            // Animated WebP: perlu -vcodec webp atau pakai libwebp decoder
            return `${base} -c:v webp -i "${input}" -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=15" -c:v libx264 -preset veryfast -pix_fmt yuv420p -movflags +faststart -an -t 30 "${output}"`
          } else if (fmt === 'gif') {
            return `${base} -i "${input}" -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=15,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -c:v libx264 -preset veryfast -pix_fmt yuv420p -movflags +faststart -an "${output}"`
          } else if (fmt === 'webm') {
            return `${base} -i "${input}" -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -preset veryfast -pix_fmt yuv420p -movflags +faststart -an "${output}"`
          } else {
            return `${base} -i "${input}" -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -preset veryfast -pix_fmt yuv420p -movflags +faststart -an "${output}"`
          }
        }

        const _runFfmpeg = (cmd) => new Promise((res, rej) => {
          exec(cmd, { timeout: 120000 }, (err, stdout, stderr) => {
            if (err) { console.error('[tomp4] ffmpeg err:', stderr?.slice(-300)); return rej(err) }
            res()
          })
        })

        // Method 1a: command utama sesuai format
        if (!_done) {
          try {
            await _runFfmpeg(_buildCmd(_tmpIn, _tmpOut, _ext))
            if (fs.existsSync(_tmpOut) && fs.statSync(_tmpOut).size > 500) _done = true
          } catch (e) { console.log('[tomp4] m1a gagal:', e.message) }
        }

        // Method 1b: fallback tanpa decoder hint
        if (!_done && _ext === 'webp') {
          try {
            if (fs.existsSync(_tmpOut)) fs.unlinkSync(_tmpOut)
            await _runFfmpeg(`ffmpeg -y -i "${_tmpIn}" -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=15" -c:v libx264 -preset ultrafast -pix_fmt yuv420p -movflags +faststart -an "${_tmpOut}"`)
            if (fs.existsSync(_tmpOut) && fs.statSync(_tmpOut).size > 500) _done = true
          } catch (e) { console.log('[tomp4] m1b gagal:', e.message) }
        }

        // Method 1c: webp → rename ke .webp dan force decode
        if (!_done && _ext === 'webp') {
          try {
            if (fs.existsSync(_tmpOut)) fs.unlinkSync(_tmpOut)
            // ffmpeg bisa baca animated webp sebagai image sequence dengan -f image2
            await _runFfmpeg(`ffmpeg -y -f webp_pipe -i "${_tmpIn}" -vf "fps=15,scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -preset ultrafast -pix_fmt yuv420p "${_tmpOut}"`)
            if (fs.existsSync(_tmpOut) && fs.statSync(_tmpOut).size > 500) _done = true
          } catch (e) { console.log('[tomp4] m1c gagal:', e.message) }
        }

        // ── METHOD 2: converter.js toVideo ──────────────────────────
        if (!_done) {
          try {
            const { toVideo } = require('../../lib/converter')
            const _mp4 = await toVideo(_buf, _ext)
            if (_mp4 && _mp4.length > 500) {
              fs.writeFileSync(_tmpOut, _mp4)
              _done = true
            }
          } catch (e) { console.log('[tomp4] m2 converter gagal:', e.message) }
        }

        // ── METHOD 3: ezgif online (webp only) ───────────────────────
        if (!_done && (_ext === 'webp' || _isSticker)) {
          try {
            const { webp2mp4File } = require('../../lib/uploader')
            const _res = await webp2mp4File(_tmpIn)
            if (_res && _res.result && _res.result.startsWith('http')) {
              const _r = await axios.get(_res.result, { responseType: 'arraybuffer', timeout: 60000 })
              fs.writeFileSync(_tmpOut, Buffer.from(_r.data))
              if (fs.statSync(_tmpOut).size > 500) _done = true
            }
          } catch (e) { console.log('[tomp4] m3 ezgif gagal:', e.message) }
        }

        if (!_done) throw new Error('Semua metode konversi gagal. Format: ' + _ext + ' | Size: ' + _buf.length + ' bytes')

        const _videoBuffer = fs.readFileSync(_tmpOut)
        await alya.sendMessage(m.chat, {
          video: _videoBuffer,
          caption: '✅ Berhasil dikonversi ke MP4!',
          mimetype: 'video/mp4'
        }, { quoted: m })

        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

      } catch (_err) {
        console.error('[tomp4] FINAL ERROR:', _err.message)
        await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        replyalya(
          '❌ Gagal konversi ke MP4!\n\n' +
          '*Penyebab:* ' + _err.message + '\n\n' +
          '*Tips:*\n' +
          '• Pastikan stiker yang di-reply adalah stiker *bergerak* (animated)\n' +
          '• Coba kirim ulang stiker lalu reply lagi\n' +
          '• Pastikan ffmpeg terinstall di server bot'
        )
      } finally {
        try { if (_tmpIn  && fs.existsSync(_tmpIn))  fs.unlinkSync(_tmpIn)  } catch {}
        try { if (_tmpOut && fs.existsSync(_tmpOut)) fs.unlinkSync(_tmpOut) } catch {}
      }
  }
}
