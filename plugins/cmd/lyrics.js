// Plugin: lyrics
// Auto-generated from Alya V12
// Commands: lirik, lyrics

const path = require('path')

module.exports = {
  command: ["lirik", "lyrics"],
  tags: ['general'],
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

        if (!q) return replytolak("⚠ *Masukkan Judul Lagu*")
        replyalya(mess.wait)

        const axios = require('axios')

        try {

            const { data } = await axios.get(
                `https://lrclib.net/api/search?q=${encodeURIComponent(q)}`,
                {
                    headers: {
                        'User-Agent':
                            'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
                    }
                }
            )

            if (!data || !data[0]) {
                return replytolak("❌ Lirik ga ada syg.")
            }

            const song = data[0]
            const lyricsRaw = song.plainLyrics || song.syncedLyrics

            if (!lyricsRaw) {
                return replytolak("❌ lagunya si ada tapi engga dengan liriknya beb.")
            }

            const cleanLyrics = lyricsRaw
                .replace(/\[.*?\]/g, '')
                .trim()

            const duration = song.duration
                ? `${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, '0')}`
                : 'Unknown'

            const caption = `┌──「 *Lirik Ditemukan* 」
    │
    │ ◦ *Judul* : ${song.trackName || '-'}
    │ ◦ *Artis* : ${song.artistName || '-'}
    │ ◦ *Album* : ${song.albumName || '-'}
    │ ◦ *Durasi* : ${duration}
    │
    └─────────────────

    ${cleanLyrics}

    ---
    _**Alya chan Assistant**_`

            await replyalya(caption)

        } catch (err) {
            console.error('Error:', err)
            replytolak(`❌ ${err.message}`)
        }
  }
}
