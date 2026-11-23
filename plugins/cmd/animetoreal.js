// Plugin: animetoreal / toreal
// Commands: animetoreal, toreal
// Ubah gambar anime menjadi foto realistis via ikyyxd API
// Upload sementara via shinzu.web.id → ikyyxd anime2real

'use strict'

const fetch    = require('node-fetch')
const FormData = require('form-data')

const _lock = new Set()

module.exports = {
  command: ['animetoreal', 'toreal'],
  tags: ['tools'],
  run: async (alya, m, ctx) => {
    const { replytolak, pushname, prefix, command } = ctx

    // ─── Dedup lock ───────────────────────────────────────────
    const msgKey = m.key?.id || `${m.chat}_${m.messageTimestamp}`
    if (_lock.has(msgKey)) return
    _lock.add(msgKey)
    setTimeout(() => _lock.delete(msgKey), 120_000)

    try {
      // ─── Limit check ──────────────────────────────────────
      const user  = global.db?.users?.[m.sender]
      const biaya = 5
      const saldo = user?.limit ?? 0

      if (saldo < biaya) {
        return m.reply(
          `*AKSES DITOLAK*\n\nLimit tidak mencukupi.\n\n• Dibutuhkan : ${biaya}\n• Sisa Limit : ${saldo}`
        )
      }

      // ─── Validasi media ───────────────────────────────────
      const target = m.quoted ? m.quoted : m
      const mime   = (target.msg || target).mimetype || ''

      if (!/image\/(jpe?g|png|webp)/.test(mime)) {
        return replytolak(
          `📸 Reply gambar anime dengan perintah:\n*.${command}*\n\n_Bot akan mengubah gambar anime menjadi foto realistis!_`
        )
      }

      // ─── React + notif proses ─────────────────────────────
      await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
      await m.reply(
        `🖼️ *Anime → Real Processing...*\n\n` +
        `👤 User    : ${pushname}\n` +
        `🤖 Engine  : Anime2Real AI\n` +
        `⏳ Estimasi: ±15-30 detik\n\n` +
        `_Mohon tunggu ya~_`
      )

      // ─── Download media ───────────────────────────────────
      const media = await alya.downloadMediaMessage(target)

      // ─── Upload ke litterbox (shinzu relay) ───────────────
      const form1 = new FormData()
      form1.append('file', media, {
        filename   : 'upload_file.jpg',
        contentType: mime.includes('png') ? 'image/png' : 'image/jpeg'
      })

      const uploadRes = await fetch('https://api.shinzu.web.id/api/upload/litterbox', {
        method : 'POST',
        body   : form1,
        headers: form1.getHeaders()
      })

      if (!uploadRes.ok) throw new Error(`Upload HTTP ${uploadRes.status}`)

      const uploadJson = await uploadRes.json()
      if (!uploadJson?.status || !uploadJson?.result?.url) {
        throw new Error('Gagal mendapatkan URL upload sementara.')
      }

      const imageUrl = uploadJson.result.url

      // ─── Kirim ke API anime2real ───────────────────────────
      const apiRes  = await fetch(
        `https://api.ikyyxd.my.id/edit/anime2real?url=${encodeURIComponent(imageUrl)}`,
        { headers: { 'User-Agent': 'AlyaBot/V20' } }
      )

      if (!apiRes.ok) throw new Error(`API HTTP ${apiRes.status}`)

      const apiJson = await apiRes.json()
      if (!apiJson?.status || !apiJson?.result?.result_url) {
        throw new Error('API gagal memproses gambar. Coba lagi nanti.')
      }

      const resultUrl = apiJson.result.result_url

      // ─── Potong limit & kirim hasil ───────────────────────
      if (user) user.limit -= biaya

      await alya.sendMessage(m.chat, {
        image  : { url: resultUrl },
        caption:
          `✨ *ANIME TO REAL SUCCESS!*\n\n` +
          `👤 Request By : ${pushname}\n` +
          `🎨 Mode       : Anime → Realistis\n` +
          `🤖 Engine     : Anime2Real AI\n\n` +
          `━━━━━━━━━━━━━━━\n` +
          `💳 Biaya  : -${biaya} Limit\n` +
          `📊 Sisa   : ${user?.limit ?? saldo - biaya} Limit`
      }, { quoted: m })

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (e) {
      console.error('[animetoreal]', e.message)
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      m.reply(`❌ *Gagal memproses gambar:* ${e.message}`)
    } finally {
      _lock.delete(msgKey)
    }
  }
}
