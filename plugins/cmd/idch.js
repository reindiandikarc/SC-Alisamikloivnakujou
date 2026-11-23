// Plugin: idch
// Auto-generated from Alya V12
// Commands: idch
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')

const path = require('path')

module.exports = {
  command: ["idch"],
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

        if (!text) return replyalya("📌 Kirim link channel WhatsApp!\nContoh: https://whatsapp.com/channel/XXXX")
        if (!text.includes("https://whatsapp.com/channel/")) return replytolak("❌ Link tautan tidak valid.")

        let result = text.split('https://whatsapp.com/channel/')[1]
        let res = await alya.newsletterMetadata("invite", result)

        let teks = `📢 *Informasi Channel WhatsApp*

    🆔 *ID:* ${res.id}
    🗒️ *Nama:* ${res.name}
    👥 *Total Pengikut:* ${res.subscribers}
    📌 *Status:* ${res.state}
    ✅ *Verifikasi:* ${res.verification == "VERIFIED" ? "Terverifikasi" : "Tidak"}
        `

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: teks
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: ""
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            hasMediaAttachment: false
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: [
                                {
                                    name: "cta_copy",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "📋 Salin ID",
                                        copy_code: `${res.id}`
                                    })
                                }
                            ]
                        })
                    })
                }
            }
        }, { quoted: m })

        return alya.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id })
  }
}
