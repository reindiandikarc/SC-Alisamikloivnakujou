// Plugin: spch
// Commands: spch, spotifych
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['spch', 'spotifych'],
  tags: ['tools'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

if (!Ryuu) return replytolak(mess.only.owner)
    if (!text) return replyalya('🎵 Masukkan judul lagu!')
    const axios = require("axios")
    const fetch = require("node-fetch")
    const fs = require("fs")
    const path = require("path")
    const os = require("os")
    const { exec } = require("child_process")
    const client_id = global.spotify_client_id
    const client_secret = global.spotify_client_secret
    const backupToken = global.spotify_backup_token
    try {
        await replyalya(`🔎 Mencari lagu *${text}* di Spotify...`)
        if (!global.spotifyToken) {
            global.spotifyToken = { token: null, expire: 0 }
        }
        async function getSpotifyToken() {
            try {
                if (global.spotifyToken.token && Date.now() < global.spotifyToken.expire)
                    return global.spotifyToken.token
                const auth = Buffer.from(`${client_id}:${client_secret}`).toString('base64')
                const res = await fetch("https://accounts.spotify.com/api/token", {
                    method: "POST",
                    headers: {
                        Authorization: `Basic ${auth}`,
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: "grant_type=client_credentials"
                })
                const json = await res.json()
                if (!json.access_token) throw json
                global.spotifyToken.token = json.access_token
                global.spotifyToken.expire = Date.now() + (json.expires_in * 1000)
                return json.access_token
            } catch {
                return backupToken
            }
        }
        async function spotifySearch(query) {
            try {
                const token = await getSpotifyToken()
                const res = await fetch(
                    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                )
                const textRes = await res.text()
                let json
                try {
                    json = JSON.parse(textRes)
                } catch {
                    throw new Error("INVALID_JSON")
                }
                if (!json.tracks?.items?.length) throw new Error("EMPTY")
                const v = json.tracks.items[0]
                return {
                    url: v.external_urls.spotify,
                    title: v.name,
                    artist: v.artists.map(a => a.name).join(", "),
                    thumbnail: v.album.images?.[0]?.url
                }
            } catch {
                const res = await fetch(`https://api.nexray.web.id/search/spotify?q=${encodeURIComponent(query)}`)
                const json = await res.json()

                if (!json.status || !json.result.length)
                    throw new Error("Lagu tidak ditemukan")
                const v = json.result[0]
                return {
                    url: v.url,
                    title: v.title,
                    artist: v.artist,
                    thumbnail: v.thumbnail
                }
            }
        }
        const data = await spotifySearch(text)
        const spotifyUrl = data.url
        const title = data.title
        const artist = data.artist
        const thumbnail = data.thumbnail

        if (!/spotify\.com\/track\//i.test(spotifyUrl)) {
            throw new Error("URL tidak valid")
        }
        const BASE_URL = "https://api.fabdl.com"
        const headers = {
            "User-Agent": "Mozilla/5.0",
            "Origin": "https://spodownloader.com",
            "Referer": "https://spodownloader.com/"
        }

        let audioBuffer

        try {
            const trackRes = await axios.get(`${BASE_URL}/spotify/get`, {
                params: { url: spotifyUrl },
                headers
            })

            const track = trackRes.data?.result
            if (!track) throw new Error("PRIMARY_FAIL")

            const convertRes = await axios.get(
                `${BASE_URL}/spotify/mp3-convert-task/${track.gid}/${track.id}`,
                { headers }
            )

            const convert = convertRes.data?.result
            if (!convert?.tid) throw new Error("PRIMARY_FAIL")

            let progress, tries = 0
            do {
                await new Promise(r => setTimeout(r, 2000))
                const progRes = await axios.get(
                    `${BASE_URL}/spotify/mp3-convert-progress/${convert.tid}`,
                    { headers }
                )
                progress = progRes.data?.result
                tries++
                if (tries > 15) throw new Error("TIMEOUT")
            } while (progress.status !== 3)

            const downloadUrl = BASE_URL + progress.download_url

            const audioRes = await axios.get(downloadUrl, {
                responseType: "arraybuffer",
                timeout: 30000
            })

            if (!audioRes.headers['content-type']?.includes("audio"))
                throw new Error("INVALID_AUDIO")

            audioBuffer = Buffer.from(audioRes.data)

        } catch (err) {
            console.log("FABDL FAIL, fallback NexRay")

            const fallback = await axios.get(
                `https://api.nexray.web.id/downloader/v1/spotify`,
                { params: { url: spotifyUrl } }
            )

            const res = fallback.data
            if (!res?.status || !res?.result?.url)
                throw new Error("FALLBACK_FAIL")

            const audioRes = await axios.get(res.result.url, {
                responseType: "arraybuffer"
            })

            audioBuffer = Buffer.from(audioRes.data)
        }
        const tempInput = path.join(os.tmpdir(), `in_${Date.now()}.mp3`)
        const tempOutput = path.join(os.tmpdir(), `out_${Date.now()}.ogg`)

        fs.writeFileSync(tempInput, audioBuffer)

        await new Promise((resolve, reject) => {
            exec(
                `ffmpeg -y -i "${tempInput}" -vn -map_metadata -1 -ac 1 -ar 48000 -c:a libopus -b:a 96k -f ogg "${tempOutput}"`,
                (err) => err ? reject(err) : resolve()
            )
        })

        const opusBuffer = fs.readFileSync(tempOutput)
        await alya.sendMessage(global.channel, {
            audio: opusBuffer,
            mimetype: "audio/ogg; codecs=opus",
            ptt: true,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.channel,
                    serverMessageId: 100,
                    newsletterName: global.channeln || global.botname
                },
                
            }
        })

        fs.unlinkSync(tempInput)
        fs.unlinkSync(tempOutput)

        replyalya(`✅ Lagu *${title}* berhasil dikirim ke channel 🎶`)

    } catch (err) {
        console.error("SpotifyCh Error:", err)
        replyalya(`❌ Error: ${err.message}`)
    }
  }
};
