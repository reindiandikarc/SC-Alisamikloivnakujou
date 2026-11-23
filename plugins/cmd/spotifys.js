// Plugin: spotifys
// Auto-generated from Alya V12
// Commands: spotifysearch, spotifys
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')

const path = require('path')

module.exports = {
  command: ["spotifysearch", "spotifys"],
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

        if (!text) return replyalya('🎵 Masukkan judul lagu!')

        await alya.sendMessage(m.chat, {
            react: { text: '🔎', key: m.key }
        })

        const fetch = require('node-fetch')

        const client_id = global.spotify_client_id
        const client_secret = global.spotify_client_secret
        let backupToken = global.spotify_backup_token

        if (!global.spotifyToken) {
            global.spotifyToken = { token: null, expire: 0 }
        }

        async function getSpotifyToken() {
            try {

                if (global.spotifyToken.token && Date.now() < global.spotifyToken.expire) {
                    return global.spotifyToken.token
                }

                const auth = Buffer.from(`${client_id}:${client_secret}`).toString('base64')

                const res = await fetch('https://accounts.spotify.com/api/token', {
                    method: 'POST',
                    headers: {
                        Authorization: `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'User-Agent': 'Mozilla/5.0'
                    },
                    body: 'grant_type=client_credentials'
                })

                const json = await res.json()

                if (!json.access_token) throw json

                global.spotifyToken.token = json.access_token
                global.spotifyToken.expire = Date.now() + (json.expires_in * 1000)

                return json.access_token

            } catch (err) {

                console.log('Token utama gagal, pakai backup')
                return backupToken

            }
        }

        async function fetchSpotify(endpoint, token) {

            const res = await fetch(`https://api.spotify.com/${endpoint}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0'
                }
            })

            return res.json()

        }

        async function fetchNexRay(query) {

            const res = await fetch(`https://api.nexray.web.id/search/spotify?q=${encodeURIComponent(query)}`)
            const json = await res.json()

            if (!json.status) throw 'API NexRay error'

            return json.result.slice(0, 5)

        }

        try {

            let data
            let results = []

            try {

                let token = await getSpotifyToken()

                data = await fetchSpotify(
                    `v1/search?q=${encodeURIComponent(text)}&type=track&limit=5`,
                    token
                )

                if (!data.tracks || data.tracks.items.length === 0) throw 'kosong'

                results = data.tracks.items.map(v => ({
                    title: v.name,
                    artist: v.artists.map(a => a.name).join(', '),
                    album: v.album.name,
                    release: v.album.release_date,
                    thumbnail: v.album.images?.[0]?.url,
                    duration:
                        Math.floor(v.duration_ms / 60000) + ':' +
                        String(Math.floor((v.duration_ms % 60000) / 1000)).padStart(2, '0'),
                    popularity: v.popularity,
                    url: v.external_urls.spotify
                }))

            } catch (err) {

                console.log('Spotify API gagal, fallback NexRay')

                const api = await fetchNexRay(text)

                results = api.map(v => ({
                    title: v.title,
                    artist: v.artist,
                    album: v.album,
                    release: v.release_date,
                    thumbnail: v.thumbnail,
                    duration: v.duration,
                    popularity: v.popularity,
                    url: v.url
                }))

            }

            if (!results.length) return replyalya('❌ Lagu tidak ditemukan.')

            let slides = []

            for (let track of results) {

                let media = await prepareWAMessageMedia(
                    { image: { url: track.thumbnail } },
                    { upload: alya.waUploadToServer }
                )

                slides.push({
                    header: proto.Message.InteractiveMessage.Header.fromObject({
                        title: `🎶 ${track.title}`,
                        hasMediaAttachment: true,
                        ...media
                    }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                        buttons: [
                            {
                                name: "quick_reply",
                                buttonParamsJson: JSON.stringify({
                                    display_text: "⬇️ Download",
                                    id: `${prefix}spdl ${track.url}`
                                })
                            },
                            {
                                name: "cta_copy",
                                buttonParamsJson: JSON.stringify({
                                    display_text: "🔗 Salin Link",
                                    copy_code: track.url
                                })
                            }
                        ]
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.create({
                        text:
                            `🎤 Artist: ${track.artist}\n` +
                            `💿 Album: ${track.album}\n` +
                            `⏱️ Durasi: ${track.duration}\n` +
                            `🔥 Popularity: ${track.popularity}\n` +
                            `📅 Rilis: ${track.release}`
                    })
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
                            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                                body: { text: `🎧 Hasil pencarian Spotify untuk *"${text}"*` },
                                carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                                    cards: slides
                                })
                            })
                        }
                    }
                },
                { quoted: m }
            )

            await alya.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

        } catch (err) {

            console.log('Spotify Error:', err)
            replyalya('❌ Spotify API sedang bermasalah.')

        }
  }
}
