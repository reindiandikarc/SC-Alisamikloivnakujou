// Plugin: kusonime_search
// Auto-generated from Alya V12
// Commands: kusonime_search
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')

const path = require('path')

module.exports = {
  command: ["kusonime_search"],
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

        if (!text) return replyalya('✍️ Contoh:\n.kusonime_search naruto')

        const { kusonime } = require('../../fitur/kusonime')
        await alya.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

        const list = await kusonime.search(text)
        if (!list.length) return replyalya('❌ Anime tidak ditemukan.')

        const rows = list.slice(0, 15).map(v => ({
            title: v.title,
            description: `${v.released}\n${v.genre.join(', ')}`,
            id: `.anime_detail ${v.url}`
        }))

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: `🔎 Hasil pencarian: *${text}*` },
                        footer: { text: botname },
                        header: { title: 'Search Result' },
                        nativeFlowMessage: {
                            buttons: [{
                                name: 'single_select',
                                buttonParamsJson: JSON.stringify({
                                    title: 'Pilih Anime',
                                    sections: [{ title: 'Hasil', rows }]
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
