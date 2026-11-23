// Plugin: dl (AIO Downloader)
// Commands: dl, download
// (Catatan: alias "aio" TIDAK dipakai di sini karena sudah terpakai
//  oleh plugins/cmd/domainmenu.js di cmd_registry.json — supaya tidak
//  menimpa command yang sudah ada.)
//
// All-in-one downloader: deteksi platform dari URL yang dikirim, lalu
// pakai scraper internal yang SUDAH ADA & teruji di project ini
// (scrape/tiktokdl.js, scrape/igdl.js, scrape/XeonFb.js,
//  scrape/XeonTwitter.js, scrape/yt.js) — bukan API pihak ketiga yang
// memaksa watermark/atribusi.
//
// Platform yang didukung: TikTok, Instagram, YouTube, Facebook, Twitter/X.
// Kalau platform tidak dikenali → kasih pesan jelas (bukan nyoba paksa
// kirim API generik yang sering gagal/ngasal).

'use strict'

module.exports = {
  command: ['dl', 'download'],
  tags: ['downloader'],
  run: async (alya, m, ctx) => {
    const {
      command, text, prefix,
      replyalya, replytolak
    } = ctx

    const db = global.db
    const url = (text || (m.quoted && m.quoted.text) || '').trim()

    if (!url) {
      return replyalya(
        `╭━━━〔 🌐 *AIO DOWNLOADER* 〕━━━⬣\n` +
        `┃\n` +
        `┃ Kirim/tempel link dari salah satu platform ini:\n` +
        `┃\n` +
        `┃ 📱 TikTok\n` +
        `┃ 📸 Instagram (post/reel)\n` +
        `┃ 🎥 YouTube (video)\n` +
        `┃ 🔵 Facebook (video)\n` +
        `┃ 🐦 Twitter/X\n` +
        `┃\n` +
        `┃ *Format:*\n` +
        `┃ ${prefix + command} <link>\n` +
        `┃\n` +
        `┃ *Contoh:*\n` +
        `┃ ${prefix + command} https://vt.tiktok.com/xxxxx\n` +
        `┗━━━━━━━━━━━━━━━━━━━━━━━━━⬣`
      )
    }

    // ── Deteksi platform ──────────────────────────────────────────────────
    let platform = null
    if (/(?:tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com)/i.test(url)) platform = 'tiktok'
    else if (/instagram\.com/i.test(url)) platform = 'instagram'
    else if (/(?:youtube\.com|youtu\.be)/i.test(url)) platform = 'youtube'
    else if (/(?:facebook\.com|fb\.watch)/i.test(url)) platform = 'facebook'
    else if (/(?:twitter\.com|x\.com)/i.test(url)) platform = 'twitter'

    if (!platform) {
      await alya.sendMessage(m.chat, { react: { text: '🙄', key: m.key } })
      return replyalya(
        `❌ *Link tidak dikenali!*\n\n` +
        `Saat ini ${prefix + command} cuma mendukung: TikTok, Instagram, ` +
        `YouTube, Facebook, dan Twitter/X.\n\n` +
        `Untuk platform lain, cek ${prefix}downloadmenu untuk command khusus ` +
        `yang tersedia (misal ${prefix}pinterest, ${prefix}spotify, dll).`
      )
    }

    // ── Cek limit ────────────────────────────────────────────────────────
    let biaya = 3
    const userAlt = db.users[m.sender]
    if (userAlt.limit < biaya) {
      return replyalya(`❌ Limit kamu tidak cukup!\n\n💡 Butuh: ${biaya}\n📊 Sisa: ${userAlt.limit}`)
    }

    await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    try {
      let sendResult = null

      // ── TIKTOK ───────────────────────────────────────────────────────────
      if (platform === 'tiktok') {
        const { tiktokDl } = require('../../scrape/tiktokdl')
        const res = await tiktokDl(url)
        if (!res || !res.status) throw new Error(res?.msg || 'Gagal mengambil data TikTok')

        const items = Array.isArray(res.data) ? res.data : []
        const isPhoto = items.some(v => v.type === 'photo')

        const caption =
          `🎥 *TikTok Downloader*\n\n` +
          `👤 Author : *${res.author?.nickname || res.author?.fullname || 'Unknown'}*\n` +
          `📝 Judul  : ${res.title || '-'}\n` +
          `⏱️ Durasi : ${res.duration || '-'}\n` +
          `❤️ Like   : ${res.stats?.likes || 0}\n` +
          `💬 Komen  : ${res.stats?.comment || 0}\n\n` +
          `━━━━━━━━━━━━━━━\n` +
          `💸 Pajak : ${biaya} Limit`

        if (isPhoto) {
          const photos = items.filter(v => v.type === 'photo').map(v => v.url)
          if (!photos.length) throw new Error('Foto tidak ditemukan')
          for (let i = 0; i < photos.length; i++) {
            await alya.sendMessage(m.chat, {
              image: { url: photos[i] },
              caption: i === 0 ? caption : ''
            }, { quoted: m })
          }
        } else {
          const nowmHd = items.find(v => v.type === 'nowatermark_hd')?.url
          const nowm   = items.find(v => v.type === 'nowatermark')?.url
          const wm     = items.find(v => v.type === 'watermark')?.url
          const videoUrl = nowmHd || nowm || wm
          if (!videoUrl || videoUrl === '/undefined') throw new Error('Video tidak ditemukan')

          await alya.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption
          }, { quoted: m })
        }
        sendResult = true
      }

      // ── INSTAGRAM ────────────────────────────────────────────────────────
      else if (platform === 'instagram') {
        const { igdl } = require('../../scrape/igdl')
        const data = await igdl(url)
        if (!data?.media?.length) throw new Error('Media tidak ditemukan')

        const caption =
          `📸 *Instagram Downloader*\n\n` +
          `👤 Author : *${data.author?.username || data.author?.fullname || 'Unknown'}*\n\n` +
          `━━━━━━━━━━━━━━━\n` +
          `💸 Pajak : ${biaya} Limit`

        for (let i = 0; i < data.media.length; i++) {
          const item = data.media[i]
          const payload = item.type === 'video'
            ? { video: { url: item.download } }
            : { image: { url: item.download } }
          await alya.sendMessage(m.chat, {
            ...payload,
            caption: i === 0 ? caption : ''
          }, { quoted: m })
        }
        sendResult = true
      }

      // ── YOUTUBE ──────────────────────────────────────────────────────────
      else if (platform === 'youtube') {
        const { ytDonlodMp4 } = require('../../scrape/yt')
        const res = await ytDonlodMp4(url)
        if (!res?.url) throw new Error('Video tidak ditemukan')

        const caption =
          `🎥 *YouTube Downloader*\n\n` +
          `📝 Judul   : ${res.title || '-'}\n` +
          `📺 Channel : ${res.channel || '-'}\n` +
          `👁️ Views   : ${res.views || '-'}\n\n` +
          `━━━━━━━━━━━━━━━\n` +
          `💸 Pajak : ${biaya} Limit`

        await alya.sendMessage(m.chat, {
          video: { url: res.url },
          caption
        }, { quoted: m })
        sendResult = true
      }

      // ── FACEBOOK ─────────────────────────────────────────────────────────
      else if (platform === 'facebook') {
        const { XeonFb } = require('../../scrape/XeonFb')
        const res = await XeonFb(url)
        const videoUrl = res?.hd || res?.sd || res?.url
        if (!videoUrl) throw new Error('Video tidak ditemukan')

        const caption =
          `🔵 *Facebook Downloader*\n\n` +
          `━━━━━━━━━━━━━━━\n` +
          `💸 Pajak : ${biaya} Limit`

        await alya.sendMessage(m.chat, {
          video: { url: videoUrl },
          caption
        }, { quoted: m })
        sendResult = true
      }

      // ── TWITTER / X ──────────────────────────────────────────────────────
      else if (platform === 'twitter') {
        const { XeonTwitter } = require('../../scrape/XeonTwitter')
        const res = await XeonTwitter(url)
        const videoUrl = res?.hd || res?.sd || res?.url
        if (!videoUrl) throw new Error('Video tidak ditemukan')

        const caption =
          `🐦 *Twitter/X Downloader*\n\n` +
          `━━━━━━━━━━━━━━━\n` +
          `💸 Pajak : ${biaya} Limit`

        await alya.sendMessage(m.chat, {
          video: { url: videoUrl },
          caption
        }, { quoted: m })
        sendResult = true
      }

      if (sendResult) {
        userAlt.limit -= biaya
        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
      }

    } catch (e) {
      console.error(`[dl/aio:${platform}]`, e?.message || e)
      await alya.sendMessage(m.chat, { react: { text: '💢', key: m.key } })
      replyalya(`❌ Gagal mengambil media dari ${platform}!\n\nError: ${e?.message || 'Unknown error'}`)
    }
  }
}
