'use strict'

module.exports = {
  command: ['stcaudio'],
  tags: ['sticker'],
  run: async (alya, m, ctx) => {
    const { prefix, command, quoted, mime, reply, replyalya } = ctx
    const biaya = 1
    const limitUser = global.db?.users?.[m.sender]?.limit || 0

    if (limitUser < biaya) {
      return replyalya(`❌ Limit kamu tidak cukup!

    💳 Limit dibutuhkan : ${biaya}
    📊 Limit kamu : ${limitUser}`)
    }

    if (!quoted) return reply(`Reply video bersuara dengan caption ${prefix + command}`)

    const quotedMsg = quoted.msg || quoted
    const isVideo = quoted.mtype === 'videoMessage' || /video/.test(mime || '') || Boolean(quotedMsg.videoMessage)
    if (!isVideo) return replyalya('❌ Harus reply video yang ada suaranya ya!')

    const seconds = Number(quotedMsg.seconds || 0)
    if (seconds > 30) return replyalya('❌ Video terlalu panjang. Maksimal 30 detik.')

    try {
      await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

      const video = await quoted.download()
      if (!video || !video.length) {
        return replyalya('❌ Gagal mengunduh video (mediaExpired/ukuran 0).')
      }

      const { extractSoundStickerMedia, sendSoundSticker } = require('../../lib/sticker-audio')
      const media = await extractSoundStickerMedia(video, {
        pack: global.packname,
        author: global.author
      })
      const result = await sendSoundSticker(alya, m.chat, media, m, {
        stickerOptions: { packname: global.packname, author: global.author }
      })

      global.db.users[m.sender].limit -= biaya
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
      if (result.fallback) {
        await replyalya('⚠️ Sound sticker ditolak server, stiker visual saja yang dikirim.')
      }
    } catch (e) {
      console.error('[stcaudio]', e?.message || e)
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {})
      replyalya(`❌ Gagal membuat sticker audio.\n_${e?.message || ''}_`)
    }
  }
}
