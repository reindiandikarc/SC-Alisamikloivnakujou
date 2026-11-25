'use strict'

module.exports = {
  command: ['stcvideo', 'stcv'],
  tags: ['sticker'],
  run: async (alya, m, ctx) => {
    const { prefix, command, quoted, mime, reply, replyalya } = ctx
    const { STICKER_AUDIO_LIMITS, extractAnimatedStickerMedia } = require('../../lib/sticker-audio')
    const biaya = 1
    const limitUser = global.db?.users?.[m.sender]?.limit || 0

    if (limitUser < biaya) {
      return replyalya(`❌ Limit kamu tidak cukup!

    💳 Limit dibutuhkan : ${biaya}
    📊 Limit kamu : ${limitUser}`)
    }

    if (!quoted) return reply(`Reply video dengan caption ${prefix + command}`)

    const quotedMsg = quoted.msg || quoted
    const isVideo = quoted.mtype === 'videoMessage' || /video/.test(mime || '') || Boolean(quotedMsg.videoMessage)
    if (!isVideo) return replyalya('❌ Harus reply video ya!')

    const seconds = Number(quotedMsg.seconds || 0)
    if (seconds > STICKER_AUDIO_LIMITS.rejectSeconds) return replyalya(`❌ Video terlalu panjang. Maksimal ${STICKER_AUDIO_LIMITS.rejectSeconds} detik.`)

    try {
      await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

      const video = await quoted.download()
      if (!video || !video.length) {
        return replyalya('❌ Gagal mengunduh video (mediaExpired/ukuran 0).')
      }

      const media = await extractAnimatedStickerMedia(video, {
        pack: global.packname,
        author: global.author,
        maxVideoSeconds: STICKER_AUDIO_LIMITS.videoSeconds
      })
      await alya.sendMessage(m.chat, {
        sticker: media.image,
        packname: global.packname,
        author: global.author
      }, { quoted: m })

      global.db.users[m.sender].limit -= biaya
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
      console.error('[stcvideo]', e?.message || e)
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {})
      replyalya(`❌ Gagal membuat sticker video.\n_${e?.message || ''}_`)
    }
  }
}
