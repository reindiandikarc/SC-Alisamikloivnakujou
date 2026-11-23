// Plugin: jadianime / toanime
// Commands: jadianime, toanime, animefyme
// Ubah foto/gambar menjadi karakter anime via live3d.io
// Pattern: sama persis dengan tohitam.js (lib/live3d → live3dEdit)

'use strict'

const fs = require('fs')
const { live3dEdit } = require('../../lib/live3d')

const _lock = new Set()

module.exports = {
  command: ['jadianime', 'toanime', 'animefyme'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { replytolak, pushname } = ctx

    // Dedup lock
    const msgKey = m.key?.id || `${m.chat}_${m.messageTimestamp}`
    if (_lock.has(msgKey)) return
    _lock.add(msgKey)
    setTimeout(() => _lock.delete(msgKey), 120000)

    try {
      const user  = global.db?.users?.[m.sender]
      const biaya = 10
      const before = user?.limit || 0

      if (before < biaya) {
        return m.reply(
          `*AKSES DITOLAK*\n\nLimit Anda tidak mencukupi.\n\n• Dibutuhkan: ${biaya}\n• Sisa Limit: ${before}`
        )
      }

      // Validasi: harus reply gambar
      if (!m.quoted) {
        return replytolak(
          `📸 Reply gambar/foto dengan perintah:\n*.jadianime* atau *.toanime*\n\n_Bot akan mengubah foto kamu menjadi karakter anime!_`
        )
      }

      const qMime = (m.quoted.msg || m.quoted).mimetype || ''
      if (!/image/.test(qMime) && !/webp/.test(qMime)) {
        return replytolak('❌ Yang di-reply harus berupa *gambar/foto*!')
      }

      const prompt = [
        'convert this person/character into a high-quality anime style illustration,',
        'anime art style, vibrant colors, detailed eyes, clean lineart,',
        '(masterpiece, best quality:1.4), anime face, 2D anime drawing,',
        'keep original clothing and accessories, studio ghibli inspired,',
        'sharp focus, beautiful composition'
      ].join(' ')

      await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
      await m.reply(
        `🎨 *Sedang mengubah foto menjadi anime...*\n\n` +
        `👤 User   : ${pushname}\n` +
        `🤖 Engine : Live3D AI\n` +
        `⏳ Estimasi: ±20-40 detik\n\n` +
        `_Mohon tunggu ya~_`
      )

      if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp', { recursive: true })

      const media = await alya.downloadAndSaveMediaMessage(m.quoted)
      const hasil = await live3dEdit(media, prompt)

      user.limit -= biaya

      await alya.sendMessage(m.chat, {
        image: { url: hasil },
        caption:
          `✨ *JADI ANIME SUCCESS!*\n\n` +
          `👤 Request By : ${pushname}\n` +
          `🎨 Mode       : Foto → Anime\n` +
          `🤖 Engine     : Live3D AI\n\n` +
          `━━━━━━━━━━━━━━━\n` +
          `💳 Biaya  : -${biaya} Limit\n` +
          `📊 Sisa   : ${user.limit} Limit`
      }, { quoted: m })

      try { fs.unlinkSync(media) } catch {}
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (e) {
      console.error('[jadianime]', e.message)
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      m.reply('❌ Gagal memproses gambar. Silakan coba lagi nanti.')
    } finally {
      _lock.delete(msgKey)
    }
  }
}
