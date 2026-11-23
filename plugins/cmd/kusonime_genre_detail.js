// Plugin: kusonime_genre_detail
// Auto-generated from Alya V12
// Commands: kusonime_genre_detail
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')

const path = require('path')

module.exports = {
  command: ["kusonime_genre_detail"],
  tags: ['ai'],
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

        if (!args[0]) return replyalya('❌ Genre tidak valid.')

        const genre = args[0]
        const page = parseInt(args[1]) || 1

        const { kusonime } = require('../../fitur/kusonime')

        await alya.sendMessage(m.chat, { react: { text: '🏷️', key: m.key } })

        const list = await kusonime.genre(genre, page)
        if (!list.length) return replyalya(`❌ Anime genre *${genre}* halaman ${page} tidak ditemukan.`)

        const rows = list.slice(0, 15).map(v => ({
            title: v.title,
            description: `${v.released}\n${v.genre.join(', ')}`,
            id: `.anime_detail ${v.url}`
        }))

        const navRows = [
            {
                title: '⬅️ Page Sebelumnya',
                description: `Halaman ${page - 1}`,
                id: `.kusonime_genre_detail ${genre} ${page - 1}`
            },
            {
                title: '➡️ Page Selanjutnya',
                description: `Halaman ${page + 1}`,
                id: `.kusonime_genre_detail ${genre} ${page + 1}`
            }
        ].filter(v => page > 1 || v.title.includes('➡️'))

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: `🏷️ *GENRE: ${genre.toUpperCase()}*\n📄 Page: ${page}` },
                        footer: { text: botname },
                        header: { title: 'Genre Anime' },
                        nativeFlowMessage: {
                            buttons: [{
                                name: 'single_select',
                                buttonParamsJson: JSON.stringify({
                                    title: 'Pilih Anime',
                                    sections: [
                                        { title: 'Daftar Anime', rows },
                                        { title: 'Page/halaman', rows: navRows }
                                    ]
                                })
                            }]
                        }
                    }
                }
            }
        }, { quoted: m })

        await alya.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id })
  }
}
