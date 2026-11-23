// Plugin: hdvid
// Commands: hdvid, enhancevideo
// Murni dari Alya V10 — pakai videoenhancer dari fitur/hdvid.js
// FIX: Ganti dari tmpfiles.org/api-faa ke unblurimage.ai (V10 method)

'use strict'

const fs = require('fs')

module.exports = {
  command: ['hdvid', 'enhancevideo'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { prefix, command, pushname, mime, reply, replyalya, replytolak } = ctx

    // Cek apakah ada video yang di-quote
    if (!m.quoted) {
      return replyalya(
        `🎬 *HD Video Enhancer*\n\n` +
        `📌 Cara pakai:\nReply video lalu ketik *${prefix + command}*\n\n` +
        `💡 Video akan ditingkatkan kualitasnya ke 4K!`
      )
    }

    const qMime = (m.quoted.msg || m.quoted).mimetype || mime || ''
    if (!/video/.test(qMime)) {
      return replytolak(`❌ Yang dikirim harus berupa *video*!\n\nReply video lalu ketik *${prefix + command}*`)
    }

    const COST = 5
    const userData = global.db?.users?.[m.sender]
    if (!userData) return replyalya('❌ Data user tidak ditemukan.')
    if ((userData.limit || 0) < COST) {
      return replyalya(
        `❌ *Limit Tidak Cukup!*\n\n` +
        `💳 Dibutuhkan : ${COST} Limit\n` +
        `📊 Limit Kamu : ${userData.limit || 0}`
      )
    }

    await alya.sendMessage(m.chat, { react: { text: '⌛', key: m.key } })
    replyalya(
      `⏳ *Sedang meningkatkan kualitas video ke HD...*\n\n` +
      `👤 User   : ${pushname}\n` +
      `🎬 Status : Uploading & Processing\n\n` +
      `_Ini mungkin butuh beberapa menit, harap sabar ya!_`
    )

    let videoPath = null
    try {
      const { videoenhancer } = require('../../fitur/hdvid')

      videoPath = await alya.downloadAndSaveMediaMessage(m.quoted)
      const result = await videoenhancer(videoPath, '4k')

      userData.limit -= COST

      await alya.sendMessage(m.chat, {
        video: { url: result.output_url },
        caption:
          `✅ *VIDEO HD BERHASIL!*\n\n` +
          `👤 Request By : ${pushname}\n` +
          `🎬 Kualitas   : *4K*\n\n` +
          `━━━━━━━━━━━━━━━\n` +
          `💳 Biaya  : -${COST} Limit\n` +
          `📊 Sisa   : ${userData.limit} Limit`
      }, { quoted: m })

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (err) {
      const errMsg = err?.message || String(err) || 'Unknown error'
      console.error('[hdvid]', errMsg)
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      replyalya(
        `❌ *Gagal meningkatkan kualitas video!*\n\n` +
        `_${errMsg}_\n\n` +
        `_Coba lagi nanti atau gunakan video yang lebih kecil_`
      )
    } finally {
      try { if (videoPath && fs.existsSync(videoPath)) fs.unlinkSync(videoPath) } catch {}
    }
  }
}
