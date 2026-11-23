// Plugin: facebookvid
// V20 — FB Downloader overhaul
// ✅ 8 sumber fallback (termasuk mobile scraping)
// ✅ HD prioritas otomatis
// ✅ Validasi URL sebelum kirim ke WA
// ✅ Support: fb.watch, facebook.com/video, /reel, /watch, m.facebook.com
// ✅ Expand shortlink otomatis
// ✅ Progress react + error message jelas

'use strict'

const { getFbVideo } = require('../../fitur/fbdl')

module.exports = {
  command: ['fb', 'facebook', 'facebookvid', 'fbvid'],
  tags: ['downloader'],
  run: async (alya, m, ctx) => {
    const { prefix, command, text, replyalya } = ctx

    if (!text) {
      return replyalya(
`╭─「 📘 *FACEBOOK VIDEO DL* 」
│
│ Download video Facebook kualitas HD.
│
│ *Cara pakai:*
│ ${prefix}${command} <link>
│
│ *Contoh:*
│ ${prefix}${command} https://fb.watch/xxxx
│ ${prefix}${command} https://www.facebook.com/reel/xxxx
│ ${prefix}${command} https://m.facebook.com/story.php?id=xxx
│
│ *Support:*
│ ✅ fb.watch (short link)
│ ✅ facebook.com/video
│ ✅ facebook.com/reel
│ ✅ facebook.com/watch
│ ✅ m.facebook.com
│ ✅ Video publik
│
│ ⚠️ Video privat tidak bisa didownload
╰──────────────────`
      )
    }

    if (!/facebook\.com|fb\.watch|fb\.com/.test(text)) {
      return replyalya('❌ Bukan link Facebook!\n\nContoh yang valid:\n`https://fb.watch/xxxxx`\n`https://www.facebook.com/reel/xxxxx`')
    }

    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
    replyalya('🔍 _Mengambil video Facebook... harap tunggu sebentar~_')

    try {
      const result = await getFbVideo(text.trim())
      const { hd, sd, source } = result

      if (!hd && !sd) {
        await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return replyalya(
          `❌ *Video tidak bisa didownload*\n\n` +
          `Kemungkinan penyebab:\n` +
          `• Video privat (hanya teman/followers)\n` +
          `• Video sudah dihapus pemiliknya\n` +
          `• Link tidak valid / kedaluwarsa\n\n` +
          `💡 *Solusi:* Pastikan video bisa dilihat publik (ikon 🌐 globe)`
        )
      }

      const videoUrl = hd || sd
      const quality  = hd ? 'HD 720p+ 🎬' : 'SD 480p 📱'

      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

      await alya.sendMessage(m.chat, {
        video  : { url: videoUrl },
        caption:
          `📘 *Facebook Video*\n\n` +
          `🎞️ Kualitas : *${quality}*\n` +
          `🔗 Via      : ${source || 'Auto'}\n` +
          (hd && sd ? `\n💡 Versi SD: ketik \`${prefix}fbsd ${text.trim()}\`` : '') +
          `\n\n_Powered by Alya Bot_ 🤖`,
      }, { quoted: m })

      if (hd && sd) {
        await alya.sendMessage(m.chat, {
          text: `📊 *Link SD (ukuran lebih kecil):*\n${sd}\n\n_Salin link di atas jika HD terlalu besar_`
        }, { quoted: m })
      }

    } catch (err) {
      console.error('[facebookvid]', err.message || err)
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      replyalya(
        `❌ *Gagal download video Facebook*\n\n` +
        `_${err.message || 'Error tidak diketahui'}_\n\n` +
        `Tips:\n` +
        `• Pastikan video bisa diakses publik 🌐\n` +
        `• Coba copy link langsung dari browser\n` +
        `• Coba beberapa menit kemudian`
      )
    }
  }
}
