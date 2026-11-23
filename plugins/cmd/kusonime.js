// Plugin: kusonime
// Auto-generated from Alya V12
// Commands: jadwalkai, kusonime
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')

const path = require('path')

module.exports = {
  command: ["jadwalkai", "kusonime"],
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

        const rows = [
            {
                title: '🔥 Anime Terbaru',
                description: 'Update anime terbaru dari Kusonime',
                id: '.anime_latest'
            },
            {
                title: '🔍 Cari Anime',
                description: 'Cari anime berdasarkan judul',
                id: '.kusonime_search'
            },
            {
                title: '🏷️ Genre Anime',
                description: 'Cari anime berdasarkan genre',
                id: '.kusonime_genre'
            }
        ]

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: '🍥 *MENU ANIME KUSONIME*' },
                        footer: { text: botname },
                        header: { title: '📺 Anime Menu' },
                        nativeFlowMessage: {
                            buttons: [{
                                name: 'single_select',
                                buttonParamsJson: JSON.stringify({
                                    title: 'Pilih Menu',
                                    sections: [{ title: 'Anime', rows }]
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
