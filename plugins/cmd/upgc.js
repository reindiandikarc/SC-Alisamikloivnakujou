// Plugin: upgc
// Fix: generateWAMessageFromContent diambil dari @whiskeysockets/baileys
// Commands: upgc

const path = require('path')
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')

module.exports = {
  command: ["upgc"],
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

      if (!Ryuu) return replytolak(mess.only.owner)

      const { fromBuffer } = require("file-type")
      const fs = require("fs")

      let contentAlt = {}
      let buffer, ext, tempFile

      if (m.quoted) {
        try {
          buffer = await m.quoted.download()
          if (!buffer) return alya.sendText(m.chat, "❌ Gagal mengambil media quoted.")
          ext = (await fromBuffer(buffer))?.ext || 'bin'
          tempFile = path.join(__dirname, `tmp_${Date.now()}.${ext}`)
          fs.writeFileSync(tempFile, buffer)

          const quotedType = m.quoted.mtype || Object.keys(m.quoted.message || {})[0] || ''
          if (/image|video|audio/.test(quotedType)) {
            if (/image/.test(quotedType)) {
              contentAlt.image = { url: tempFile }
              if (text) contentAlt.caption = text
            } else if (/video/.test(quotedType)) {
              contentAlt.video = { url: tempFile }
              if (text) contentAlt.caption = text
            } else if (/audio/.test(quotedType)) {
              const sizeMB = fs.statSync(tempFile).size / (1024 * 1024)
              if (sizeMB > 10) {
                fs.unlinkSync(tempFile)
                return alya.sendText(m.chat, "⚠️ Audio terlalu besar! Maksimal 10MB.")
              }
              contentAlt.audio = { url: tempFile }
              contentAlt.ptt = false
            }
          } else {
            fs.unlinkSync(tempFile)
            return alya.sendText(m.chat, "Reply harus berupa image/video/audio.")
          }
        } catch (e) {
          console.error(e)
          return alya.sendText(m.chat, "❌ Media tidak valid atau gagal diproses.")
        }
      } else if (text) {
        contentAlt.text = text
      } else {
        return alya.sendText(m.chat, "Kirim media (foto/video/audio) atau teks, bisa dengan reply atau langsung.")
      }

      if (contentAlt.text && !contentAlt.text.trim()) return alya.sendText(m.chat, "Teks tidak boleh kosong.")

      let grupList = await store.chats.all().filter(v => v.id.endsWith('@g.us')).map(v => v.id)
      let validGroups = []
      for (let gid of grupList) {
        try {
          let metadata = await alya.groupMetadata(gid)
          validGroups.push({
            title: metadata.subject,
            description: gid,
            id: `.sendupgc ${gid}`
          })
        } catch (e) {}
      }

      if (!validGroups.length) {
        if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile)
        return alya.sendText(m.chat, "Tidak ada grup valid yang bisa dipilih.")
      }

      let msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
            interactiveMessage: proto.Message.InteractiveMessage.create({
              body: proto.Message.InteractiveMessage.Body.create({
                text: "```Pilih Grup Tujuan 📤```"
              }),
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                buttons: [
                  {
                    name: "single_select",
                    buttonParamsJson: JSON.stringify({
                      title: "PILIH GRUP",
                      sections: [{ title: "Daftar Grup", rows: validGroups }]
                    })
                  }
                ]
              })
            })
          }
        }
      }, { quoted: m })

      await alya.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id })
  }
}
