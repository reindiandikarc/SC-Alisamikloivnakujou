// Plugin: delwl
// Auto-generated from Alya V12
// Commands: delwl
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')

const path = require('path')

module.exports = {
  command: ["delwl"],
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

        if (!Ryuu) return replytolak("❌ Hanya owner yang bisa menggunakan perintah ini.")
        if (whitelist.length < 1) return replyalya("⚠️ Tidak ada grup di whitelist.")

        let rows = []
        for (let id of whitelist) {
            let name = await getGcName(id)
            rows.push({
                title: name,
                description: id,
                id: `.confirmdelwl ${id}`
            })
        }

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: {
                        body: {
                            text: '📋 Pilih grup yang ingin dihapus dari whitelist:'
                        },
                        footer: {
                            text: 'Alya-chan Assistant'
                        },
                        header: {
                            title: '🗑️ Daftar Whitelist'
                        },
                        nativeFlowMessage: {
                            buttons: [{
                                name: "single_select",
                                buttonParamsJson: JSON.stringify({
                                    title: "Pilih Grup",
                                    sections: [{
                                        title: "Whitelist Aktif",
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
