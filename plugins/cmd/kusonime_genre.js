// Plugin: kusonime_genre
// Auto-generated from Alya V12
// Commands: kusonime_genre
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')

const path = require('path')

module.exports = {
  command: ["kusonime_genre"],
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

        const genres = [
            'Action','Adventure','Cars','Comedy','Crime','Dementia','Demon','Demons',
            'Detective','Drama','Ecchi','Fantasy','Game','Gourmet','Harem','Historical',
            'Horror','Josei','Kids','Magic','Martial Arts','Mecha','Military','Music',
            'Mystery','Mythology','Parody','Police','Psychological','Romance','Samurai',
            'School','Sci-Fi','Seinen','Shojou','Shoujo','Shoujo Ai','Shounen',
            'Shounen Ai','Slice of Life','Space','Sports','Super Power','Supernatural',
            'Suspense','Thriller','Vampire','Yaoi','Yuri'
        ]

        const rows = genres.map(g => ({
            title: g,
            description: `Anime genre ${g}`,
            id: `.kusonime_genre_detail ${g.toLowerCase().replace(/\s+/g, '-') } 1`
        }))

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: '🏷️ *PILIH GENRE ANIME*' },
                        footer: { text: botname },
                        header: { title: 'Genre List' },
                        nativeFlowMessage: {
                            buttons: [{
                                name: 'single_select',
                                buttonParamsJson: JSON.stringify({
                                    title: 'Pilih Genre',
                                    sections: [{ title: 'Genre Lengkap', rows }]
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
