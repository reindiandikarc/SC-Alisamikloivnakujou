// Plugin: spotifydl
// Fixed for V13: tambah alias spdl & spotify, update teks loading
// Commands: spotifydl, spdl, spotify

const path = require('path')

module.exports = {
  command: ["spotifydl", "spdl", "spotify"],
  tags: ['downloader'],
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

    const db = global.db
      // ============================================================
      // ALYA V12 - .spdl / .spotifydl
      // Download lagu dari Spotify menggunakan fabdl + fallback YT
      // ============================================================
      let biaya = 2
      let userAlt = db.users[m.sender]
      if (userAlt.limit < biaya) return replyalya(`❌ Limit kamu tidak cukup!\n\n💡 Dibutuhkan: ${biaya} limit`)
      if (!text) return replyalya(`🎵 Contoh penggunaan:\n*${prefix + command}* https://open.spotify.com/track/xxxx`)
      if (!/spotify\.com\/track\//i.test(text)) return replyalya('❌ Link Spotify tidak valid.\nContoh: https://open.spotify.com/track/xxxxxx')

      await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
      replyalya('🎵 Sedang mendownload lagu via Spotify, harap tunggu sebentar~')

      const spotifyUrl = text.split('?')[0]
      const trackIdMatch = spotifyUrl.match(/track\/([a-zA-Z0-9]+)/)
      if (!trackIdMatch) return replyalya('❌ Format link Spotify tidak valid.')
      const trackId = trackIdMatch[1]

      // Helper: ambil metadata via Spotify Web API
      async function getSpotifyMeta(id) {
        try {
          const cid = global.spotify_client_id || 'f8d0d37c39cc4ed68950b72fa9f85be9'
          const cs  = global.spotify_client_secret || '8531d4c9fa6745a0b56b9c8023bd75a0'
          const basic = Buffer.from(`${cid}:${cs}`).toString('base64')
          const tok = await axios.post('https://accounts.spotify.com/api/token',
            'grant_type=client_credentials',
            { headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 8000 }
          )
          const t = (await axios.get(`https://api.spotify.com/v1/tracks/${id}`,
            { headers: { Authorization: `Bearer ${tok.data.access_token}` }, timeout: 8000 }
          )).data
          return {
            name: t.name,
            artist: t.artists.map(a => a.name).join(', '),
            album: t.album?.name || '',
            cover: t.album?.images?.[0]?.url || '',
            duration: Math.floor(t.duration_ms / 60000) + ':' + String(Math.floor((t.duration_ms % 60000) / 1000)).padStart(2, '0')
          }
        } catch { return { name: 'Spotify Track', artist: 'Unknown', album: '', cover: '', duration: '0:00' } }
      }

      // METHOD 1: fabdl.com — paling stabil untuk Spotify
      async function tryFabdl(url) {
        const r = await axios.get(`https://api.fabdl.com/spotify/get?url=${encodeURIComponent(url)}`, {
          headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
          timeout: 15000
        })
        if (!r.data?.result?.id) throw new Error('fabdl: no task id')
        const taskId = r.data.result.id
        const gid    = r.data.result.gid
        // Poll convert
        for (let i = 0; i < 15; i++) {
          await new Promise(res => setTimeout(res, 3000))
          const p = await axios.get(`https://api.fabdl.com/spotify/mp3-convert-task/${gid}/${taskId}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000
          })
          if (p.data?.result?.download_url) {
            const audio = await axios.get(p.data.result.download_url, {
              responseType: 'arraybuffer', timeout: 90000,
              headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://fabdl.com/' }
            })
            return Buffer.from(audio.data)
          }
        }
        throw new Error('fabdl: timeout polling')
      }

      // METHOD 2: spotifydownloads.org (scraper free)
      async function trySpotifyDownloads(url) {
        const r1 = await axios.post('https://spotifydownloads.org/api/download',
          new URLSearchParams({ url, quality: '320' }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Origin': 'https://spotifydownloads.org',
              'Referer': 'https://spotifydownloads.org/',
              'User-Agent': 'Mozilla/5.0'
            }, timeout: 20000
          }
        )
        const dlUrl = r1.data?.url || r1.data?.download_url
        if (!dlUrl) throw new Error('spotifydownloads: no url')
        const audio = await axios.get(dlUrl, {
          responseType: 'arraybuffer', timeout: 90000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        })
        return Buffer.from(audio.data)
      }

      // METHOD 3: loader.to (YouTube bridge)
      async function tryLoaderTo(url) {
        const r1 = await axios.post('https://loader.to/ajax/download.php',
          new URLSearchParams({ format: '128', url }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Origin': 'https://loader.to', 'Referer': 'https://loader.to/',
              'User-Agent': 'Mozilla/5.0'
            }, timeout: 12000
          }
        )
        const id = r1.data?.id
        if (!id) throw new Error('loader.to: no id')
        for (let i = 0; i < 20; i++) {
          await new Promise(res => setTimeout(res, 3000))
          const p = await axios.get(`https://loader.to/ajax/progress.php?id=${id}`, {
            headers: { 'Referer': 'https://loader.to/', 'User-Agent': 'Mozilla/5.0' }, timeout: 8000
          })
          if (p.data?.download_url) {
            const audio = await axios.get(p.data.download_url, {
              responseType: 'arraybuffer', timeout: 90000,
              headers: { 'User-Agent': 'Mozilla/5.0' }
            })
            return Buffer.from(audio.data)
          }
        }
        throw new Error('loader.to: timeout')
      }

      // METHOD 4: YT Music bridge via yts + ytdl
      async function tryYtBridge(meta) {
        const q = encodeURIComponent(`${meta.name} ${meta.artist} official audio`)
        const yt = await axios.get(`https://www.youtube.com/results?search_query=${q}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000
        })
        const match = yt.data.match(/"videoId":"([a-zA-Z0-9_-]{11})"/)
        if (!match) throw new Error('ytbridge: no video found')
        const ytUrl = `https://www.youtube.com/watch?v=${match[1]}`
        const r = await axios.get(`https://api.vevioz.com/api/button/mp3/${match[1]}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000
        })
        const dlUrl = r.data?.match?.(/href="(https:\/\/[^"]+\.mp3[^"]*)"/)?.[1] ||
                      r.data?.url
        if (!dlUrl) throw new Error('ytbridge: no dl url')
        const audio = await axios.get(dlUrl, {
          responseType: 'arraybuffer', timeout: 90000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        })
        return Buffer.from(audio.data)
      }

      // METHOD 5: musicfab.io (direct metadata+download endpoint)
      async function tryMusicfab(url) {
        const r = await axios.post(
          'https://musicfab.io/api/spotify',
          { url },
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36',
              'Accept': '*/*',
              'Content-Type': 'application/json',
              'Origin': 'https://musicfab.io',
              'Referer': 'https://musicfab.io/'
            },
            timeout: 20000,
            validateStatus: () => true
          }
        )
        const dlUrl = r.data?.data?.metadata?.download
        if (!dlUrl) throw new Error('musicfab: no download url')
        const audio = await axios.get(dlUrl, {
          responseType: 'arraybuffer', timeout: 90000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        })
        return Buffer.from(audio.data)
      }

      try {
        const meta = await getSpotifyMeta(trackId)
        let buffer = null
        let usedMethod = ''

        const methods = [
          { name: 'FabDL',             fn: () => tryFabdl(spotifyUrl) },
          { name: 'SpotifyDownloads',  fn: () => trySpotifyDownloads(spotifyUrl) },
          { name: 'Loader.to',         fn: () => tryLoaderTo(spotifyUrl) },
          { name: 'Musicfab',          fn: () => tryMusicfab(spotifyUrl) },
          { name: 'YT Music Bridge',   fn: () => tryYtBridge(meta) }
        ]

        for (const method of methods) {
          try {
            console.log(`[SPDL] Mencoba ${method.name}...`)
            buffer = await method.fn()
            if (buffer && buffer.length > 50000) { usedMethod = method.name; break }
            else buffer = null
          } catch (e) {
            console.log(`[SPDL] ${method.name} gagal:`, e.message)
          }
        }

        if (!buffer || buffer.length < 50000) throw new Error('Semua method gagal mengunduh audio')

        // Ambil thumbnail cover
        let thumbBuffer
        try {
          if (meta.cover) {
            const t = await axios.get(meta.cover, { responseType: 'arraybuffer', timeout: 10000 })
            thumbBuffer = Buffer.from(t.data)
          }
        } catch {}

        await alya.sendMessage(m.chat, {
          audio: buffer,
          mimetype: 'audio/mpeg',
          fileName: `${meta.name} - ${meta.artist}.mp3`,
          contextInfo: {}
        }, { quoted: m })

        userAlt.limit -= biaya
        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        console.log(`[SPDL] Berhasil via ${usedMethod} | ${meta.name}`)

      } catch (err) {
        console.log('[SPDL] ERROR:', err.message)
        await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        replyalya('❌ Gagal download lagu Spotify.\n\nSemua sumber sedang tidak tersedia, coba lagi nanti.')
      }
  }
}
