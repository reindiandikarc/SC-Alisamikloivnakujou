// Plugin: anime_latest
// Auto-generated from Alya V12
// Commands: anime_latest
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')

const path = require('path')

module.exports = {
  command: ["anime_latest"],
  tags: ['anime'],
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

        const axios = require('axios')
        const cheerio = require('cheerio')

        const page = parseInt(args[0]) || 1
        const url = page === 1
            ? 'https://kusonime.com/'
            : `https://kusonime.com/page/${page}`

        await alya.sendMessage(m.chat, {
            react: { text: '🔥', key: m.key }
        })

        const { data } = await axios.get(url)
        const $ = cheerio.load(data)

        const list = []

        $(".venz > ul > .kover").each((i, el) => {
            const item = $(el)

            const title = item.find(".content h2 a").text().trim()
            const animeUrl = item.find(".content h2 a").attr("href")

            const thumb = item.find(".thumb img").attr("src")
                || item.find(".thumb img").attr("data-src")

            const released = item
                .find('.content p:has(i.fa-clock-o)')
                .text()
                .replace("Released on", "")
                .trim()

            const genre = item
                .find('.content p:has(i.fa-tag) a')
                .map((_, g) => $(g).text().trim())
                .get()

            list.push({ title, animeUrl, thumb, released, genre })
        })

        if (!list.length) {
            return replyalya(`❌ Tidak ada anime di halaman ${page}.`)
        }

        const rows = list.slice(0, 15).map(v => ({
            title: v.title,
            description: `${v.released}\n${v.genre.join(', ')}`,
            id: `.anime_detail ${v.animeUrl}`
        }))

        const navRows = [
            ...(page > 1 ? [{
                title: '⬅️ Page Sebelumnya',
                description: `Halaman ${page - 1}`,
                id: `.anime_latest ${page - 1}`
            }] : []),
            {
                title: '➡️ Page Selanjutnya',
                description: `Halaman ${page + 1}`,
                id: `.anime_latest ${page + 1}`
            }
        ]

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: {
                            text: `🔥 *ANIME UPDATE*\n📄 Page: ${page}`
                        },
                        footer: {
                            text: botname
                        },
                        header: {
                            title: 'Kusonime'
                        },
                        nativeFlowMessage: {
                            buttons: [{
                                name: 'single_select',
                                buttonParamsJson: JSON.stringify({
                                    title: 'Pilih',
                                    sections: [
                                        { title: 'ANIME UPDATE', rows },
                                        { title: 'PAGE/HALAMAN', rows: navRows }
                                    ]
                                })
                            }]
                        }
                    }
                }
            }
        }, { quoted: m })

        await alya.relayMessage(
            msg.key.remoteJid,
            msg.message,
            { messageId: msg.key.id }
        )
  }
}
