// Plugin: spotify
// V20 FINAL:
//   ✅ Cari lagu via Spotify API (bukan YouTube) → nama resmi Spotify
//   ✅ Carousel multi hasil (5 lagu) menggunakan proto + prepareWAMessageMedia (di-require sendiri)
//   ✅ Tombol "⬇️ Download MP3" trigger .spdl <spotify_url> → langsung download
//   ✅ Fallback ke NexRay API jika Spotify API gagal
//   ✅ Keterangan jelas: sumber dari Spotify
// Commands: spotify

'use strict'

const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = require('@whiskeysockets/baileys')
const axios = require('axios')

// ── Token Spotify (cached global) ─────────────────────────────
async function getSpotifyToken() {
  if (global.spotifyToken?.token && Date.now() < (global.spotifyToken?.expire || 0)) {
    return global.spotifyToken.token
  }
  const cid = global.spotify_client_id || 'acc6302297e040aeb6e4ac1fbdfd62c3'
  const cs  = global.spotify_client_secret || '0e8439a1280a43aba9a5bc0a16f3f009'
  try {
    const { data } = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${cid}:${cs}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 8000
      }
    )
    if (!global.spotifyToken) global.spotifyToken = {}
    global.spotifyToken.token  = data.access_token
    global.spotifyToken.expire = Date.now() + (data.expires_in * 1000)
    return data.access_token
  } catch {
    return global.spotify_backup_token || ''
  }
}

// ── Search Spotify API ─────────────────────────────────────────
async function searchSpotify(query, limit = 5) {
  const token = await getSpotifyToken()
  const { data } = await axios.get('https://api.spotify.com/v1/search', {
    params: { q: query, type: 'track', limit },
    headers: { Authorization: `Bearer ${token}` },
    timeout: 10000
  })
  if (!data.tracks?.items?.length) throw new Error('EMPTY')
  return data.tracks.items.map(v => ({
    title    : v.name,
    artist   : v.artists.map(a => a.name).join(', '),
    album    : v.album.name,
    release  : v.album.release_date?.slice(0, 4) || '',
    thumbnail: v.album.images?.[0]?.url || '',
    duration :
      Math.floor(v.duration_ms / 60000) + ':' +
      String(Math.floor((v.duration_ms % 60000) / 1000)).padStart(2, '0'),
    popularity: v.popularity,
    url      : v.external_urls.spotify
  }))
}

// ── Fallback: NexRay ───────────────────────────────────────────
async function searchNexRay(query) {
  const { data } = await axios.get(
    `https://api.nexray.web.id/search/spotify?q=${encodeURIComponent(query)}`,
    { timeout: 10000 }
  )
  if (!data.status || !data.result?.length) throw new Error('NEXRAY_EMPTY')
  return data.result.slice(0, 5).map(v => ({
    title    : v.title,
    artist   : v.artist,
    album    : v.album || '-',
    release  : v.release_date?.slice(0, 4) || '',
    thumbnail: v.thumbnail || '',
    duration : v.duration || '0:00',
    popularity: v.popularity || 0,
    url      : v.url
  }))
}

module.exports = {
  command: ['spotify'],
  tags: ['downloader'],
  run: async (alya, m, ctx) => {
    const { command, text, prefix, replyalya } = ctx

    if (!text) {
      return replyalya(
        `🎵 Cari lagu apa di Spotify?\n\n` +
        `Contoh: *${prefix + command}* Shape of You Ed Sheeran\n\n` +
        `💡 Bot akan menampilkan 5 hasil dan kamu tinggal ketuk tombol untuk download MP3!`
      )
    }

    try {
      await alya.sendMessage(m.chat, { react: { text: '🎵', key: m.key } })
      replyalya(`🔍 _Mencari "${text}" di Spotify..._`)

      // Search Spotify
      let results = []
      try {
        results = await searchSpotify(text, 5)
      } catch (e) {
        console.log('[spotify] Spotify API gagal, fallback NexRay:', e.message)
        results = await searchNexRay(text)
      }

      if (!results.length) {
        return replyalya('❌ Lagu tidak ditemukan di Spotify. Coba kata kunci lain!')
      }

      // ── Build Carousel ─────────────────────────────────────
      const slides = []

      for (const track of results) {
        let mediaObj = {}
        try {
          if (track.thumbnail) {
            mediaObj = await prepareWAMessageMedia(
              { image: { url: track.thumbnail } },
              { upload: alya.waUploadToServer }
            )
          }
        } catch (e) {
          console.warn('[spotify] Thumbnail upload gagal:', e.message)
        }

        slides.push({
          header: proto.Message.InteractiveMessage.Header.create({
            ...mediaObj,
            title: `🎵 ${track.title}`,
            hasMediaAttachment: !!mediaObj.imageMessage
          }),
          nativeFlowMessage: {
            buttons: [
              {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                  display_text: '⬇️ Download MP3',
                  id: `${prefix}spdl ${track.url}`
                })
              },
              {
                name: 'cta_copy',
                buttonParamsJson: JSON.stringify({
                  display_text: '🔗 Salin Link',
                  copy_code: track.url
                })
              }
            ]
          },
          footer: {
            text:
              `🎤 ${track.artist}\n` +
              `💿 ${track.album}${track.release ? ` (${track.release})` : ''}\n` +
              `⏱️ ${track.duration}` +
              (track.popularity ? ` • 🔥 ${track.popularity}/100` : '')
          }
        })
      }

      const msg = await generateWAMessageFromContent(
        m.chat,
        {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2
              },
              interactiveMessage: {
                body: {
                  text:
                    `🎧 *Hasil pencarian Spotify*\n` +
                    `🔍 Kata kunci: *"${text}"*\n\n` +
                    `Pilih lagu dan ketuk *Download MP3* untuk langsung download! 👆`
                },
                footer: {
                  text: '🟢 Powered by Spotify API • Alya Bot'
                },
                carouselMessage: {
                  cards: slides,
                  messageVersion: 1
                }
              }
            }
          }
        },
        { quoted: m }
      )

      await alya.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (err) {
      console.error('[spotify]', err.message)
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      replyalya(
        `❌ Spotify search gagal.\n\n` +
        `_${err.message || 'Error tidak diketahui'}_\n\n` +
        `Coba beberapa saat lagi atau ketik kata kunci berbeda.`
      )
    }
  }
}
