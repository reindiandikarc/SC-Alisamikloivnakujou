// Plugin: spotifydl4
// Auto-generated from Alya V12
// Commands: spotifydl4

const path = require('path')

module.exports = {
  command: ["spotifydl4"],
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

        await alya.sendMessage(m.chat, {
            react: { text: '⏱️', key: m.key }
        })

        if (!text) {
            return replyalya(
                `Example:\n${prefix + command} https://open.spotify.com/track/5O2P9iiztwhomNh8xkR9lJ`
            )
        }

        try {
            const axios = require("axios")
            const cheerio = require("cheerio")
            const { spotifydl } = require("./scrape/spotifydl")

            const trackUrl = text.split("?")[0]

            const result = await spotifydl(trackUrl)

            const spotifyPage = await axios.get(trackUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                }
            })

            const $ = cheerio.load(spotifyPage.data)

            const title =
                $('meta[property="og:title"]').attr("content") ||
                result.title

            const description =
                $('meta[property="og:description"]').attr("content") ||
                "Unknown Artist"

            const thumbnail =
                $('meta[property="og:image"]').attr("content") ||
                ""

            await alya.sendMessage(
                m.chat,
                {
                    audio: result.audio,
                    mimetype: "audio/mpeg",
                    fileName: `${title}.mp3`,
                    contextInfo: {},
                    caption: `🎵 *${title}*\n👤 ${description}`
                },
                { quoted: m }
            )

            await alya.sendMessage(m.chat, {
                react: { text: "✅", key: m.key }
            })

        } catch (err) {
            console.log(err)
            replyalya(`❌ Error: ${err.message}`)
        }
  }
}
