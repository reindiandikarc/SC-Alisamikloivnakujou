// Plugin: tiktokmp3 / ttaudio
// Commands: ttmp3, tiktokmp3, ttaudio
// FIX: tambahkan 'ttaudio' ke command list (sebelumnya tidak ada → tidak respond)
//      + cookie handling fix + fallback mp3 extractor

'use strict'

module.exports = {
  command: ["ttmp3", "tiktokmp3", "ttaudio"],
  tags: ['downloader'],
  run: async (alya, m, ctx) => {
    const { command, text, prefix, replyalya } = ctx

    const db = global.db
    let biaya = 2
    if (db.users[m.sender].limit < biaya) {
      return replyalya(`❌ Limit kamu tidak cukup!\n\n💡 Limit dibutuhkan: ${biaya}`)
    }

    // Cek input: text dari command, atau teks dari pesan yang di-quote
    const urlInput = text || (m.quoted && (m.quoted.text || ''))
    const urlMatch = urlInput?.match(/https?:\/\/[^\s]+tiktok[^\s]+/)
    const urlTiktok = urlMatch ? urlMatch[0] : null

    if (!urlTiktok) {
      return replyalya(
        `🎵 *TikTok Audio Downloader*\n\n` +
        `Kirim link TikTok untuk download audio MP3-nya!\n\n` +
        `📌 Contoh: *${prefix + command}* https://vt.tiktok.com/...\n` +
        `📌 Atau reply video TikTok pakai *${prefix + command}*`
      )
    }

    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    try {
      const axios   = require('axios')
      const cheerio = require('cheerio')

      // ── Coba NexRay dulu untuk mp3 (lebih cepat) ──
      let audioUrl  = null
      let username  = 'TikTok Audio'
      let songTitle = ''

      try {
        const api = await axios.get(`https://api.nexray.web.id/downloader/tiktok?url=${encodeURIComponent(urlTiktok)}`)
        if (api.data?.status && api.data?.result?.music_info?.url) {
          audioUrl  = api.data.result.music_info.url
          username  = api.data.result.author?.fullname || username
          songTitle = api.data.result.music_info?.title || ''
        }
      } catch (e) { console.log('[ttaudio] NexRay skip:', e.message) }

      // ── Fallback: savett.cc scrape ──
      if (!audioUrl) {
        const headers = {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Origin': 'https://savett.cc',
          'Referer': 'https://savett.cc/en1/download',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10)'
        }

        const page   = await axios.get('https://savett.cc/en1/download')
        const csrf   = page.data.match(/name="csrf_token" value="([^"]+)"/)?.[1]
        const cookie = page.headers['set-cookie']?.map(v => v.split(';')[0]).join('; ') || ''

        const post = await axios.post(
          'https://savett.cc/en1/download',
          `csrf_token=${encodeURIComponent(csrf)}&url=${encodeURIComponent(urlTiktok)}`,
          { headers: { ...headers, Cookie: cookie } }
        )

        const $ = cheerio.load(post.data)
        username = $('#video-info h3').first().text().trim() || username

        $('#formatselect option').each((_, el) => {
          if (audioUrl) return
          const label = $(el).text().toLowerCase()
          const raw   = $(el).attr('value')
          if (!raw || !label.includes('mp3')) return
          try {
            const json = JSON.parse(raw.replace(/&quot;/g, '"'))
            if (json.URL?.[0]) audioUrl = json.URL[0]
          } catch {}
        })
      }

      if (!audioUrl) throw new Error('Audio tidak ditemukan di semua sumber.')

      await alya.sendMessage(m.chat, {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        fileName: `${username}${songTitle ? ' - ' + songTitle : ''}.mp3`
      }, { quoted: m })

      db.users[m.sender].limit -= biaya

      await alya.sendMessage(m.chat, { react: { text: '🎵', key: m.key } })
      replyalya(
        `✅ *Audio TikTok Berhasil!*\n\n` +
        `👤 User: *${username}*${songTitle ? `\n🎵 Lagu: *${songTitle}*` : ''}\n\n` +
        `💸 Limit terpakai: ${biaya}\n📊 Sisa: ${db.users[m.sender].limit}`
      )

    } catch (err) {
      console.error('[ttaudio]', err.message || err)
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      replyalya('❌ *Gagal download audio TikTok.*\n\n_Pastikan link valid dan coba lagi nanti_')
    }
  }
}
