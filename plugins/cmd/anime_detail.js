// Plugin: anime_detail
// Auto-generated from Alya V12
// Commands: anime_detail
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')

const path = require('path')

module.exports = {
  command: ["anime_detail"],
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

        const { kusonime } = require('../../fitur/kusonime')
        const url = args[0]
        if (!url) return replyalya('❌ URL tidak valid.')

        const { metadata } = await kusonime.detail(url)

        let teks = `🍥 *${metadata.title}*\n\n`
        for (const [k, v] of Object.entries(metadata.info || {})) {
            teks += `• ${k.replace(/_/g, ' ')}: ${
                Array.isArray(v) ? v.join(', ') : v
            }\n`
        }
        const media = await prepareWAMessageMedia({
            image: { url: metadata.poster_url }
        }, { upload: alya.waUploadToServer })

        const rows = [
            {
                title: '⬇️ Download Anime',
                description: 'Lihat link download',
                id: `anime_download ${url}`
            },
            {
                title: '⬅️ Kembali ke Latest',
                description: 'Lihat anime terbaru',
                id: 'anime_latest'
            }
        ]

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: {
                            hasMediaAttachment: true,
                            imageMessage: media.imageMessage
                        },
                        body: { text: teks },
                        footer: { text: botname },
                        nativeFlowMessage: {
                            buttons: [{
                                name: 'single_select',
                                buttonParamsJson: JSON.stringify({
                                    title: 'Menu',
                                    sections: [{ title: 'Menu', rows }]
                                })
                            }]
                        }
                    }
                }
            }
        }, { quoted: m })

        await alya.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  }
}
