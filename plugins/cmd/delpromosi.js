// Plugin: delpromosi
// Auto-generated from Alya V12
// Commands: delpromosi
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')

const path = require('path')

module.exports = {
  command: ["delpromosi"],
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

    const db = global.db
        if (!m.isGroup) return replyalya(mess.only.group)
        if (!isAdmins && !Ryuu) return replyalya('❌ Khusus admin!')

        let data = db.data.chats[m.chat].antipromosi
        if (!data || Object.keys(data.count).length < 1) {
            return replyalya('✅ Tidak ada user yang kena warning.')
        }

        let rows = []

        for (let user in data.count) {
            rows.push({
                title: `@${user.split('@')[0]}`,
                description: `Warning: ${data.count[user]}x`,
                id: `.delpromosi_exec ${user}`
            })
        }
        rows.push({
            title: '🧹 Reset Semua Warning',
            description: 'Hapus semua data warning',
            id: `.delpromosi_exec all`
        })

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: {
                        body: {
                            text: '📋 Pilih user untuk hapus warning:'
                        },
                        footer: {
                            text: 'Alya-chan Assistant'
                        },
                        header: {
                            title: '🚫 Anti Promosi'
                        },
                        nativeFlowMessage: {
                            buttons: [{
                                name: "single_select",
                                buttonParamsJson: JSON.stringify({
                                    title: "Pilih User",
                                    sections: [{
                                        title: "User Warning",
                                        rows
                                    }]
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
