// Plugin: upsw
// Auto-generated from Alya V12
// Commands: status, upsw

const path = require('path')

module.exports = {
  command: ["status", "upsw"],
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

        if (!Ryuu) return replyalya(mess.only.owner)

        try {
            const fs = require('fs')
            await alya.sendMessage(m.chat, {
                react: { text: '⏳', key: m.key }
            })
            if (!text && !m.quoted) {
                return replyalya(
                    `📢 Upload Status WhatsApp\n\n` +
                    `Cara pakai:\n` +
                    `• ${prefix + command} teks\n` +
                    `• Reply gambar/video lalu ${prefix + command} caption`
                )
            }
            let users = []
            try {
                users = JSON.parse(fs.readFileSync('./database/user.json'))
            } catch {
                users = []
            }
            let statusJidList = []
            for (let jid of users) {
                try {
                    let number = jid.split('@')[0]
                    let check = await alya.onWhatsApp(number)
                    if (check && check.length > 0) {
                        statusJidList.push(check[0].jid)
                    }
                } catch {}
            }
            if (statusJidList.length < 1) {
                statusJidList.push(m.sender)
            }
            if (!m.quoted) {
                await alya.sendMessage(
                    'status@broadcast',
                    { text: text },
                    { statusJidList }
                )
            } else {
                let mime = m.quoted.mimetype || ''
                let media = await m.quoted.download()
                if (/image/.test(mime)) {
                    await alya.sendMessage(
                        'status@broadcast',
                        {
                            image: media,
                            caption: text || ''
                        },
                        { statusJidList }
                    )
                } else if (/video/.test(mime)) {
                    await alya.sendMessage(
                        'status@broadcast',
                        {
                            video: media,
                            caption: text || ''
                        },
                        { statusJidList }
                    )
                } else {
                    await alya.sendMessage(m.chat, {
                        react: { text: '❌', key: m.key }
                    })
                    return replyalya('❌ Media tidak didukung')
                }
            }
            await alya.sendMessage(m.chat, {
                react: { text: '✅', key: m.key }
            })
            replyalya(
                `✅ Status berhasil diupload\n` +
                `👀 Target jumlah viewer: ${statusJidList.length} orang`
            )
        } catch (err) {
            console.log(err)

            await alya.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            })
            replyalya('❌ Gagal upload status WhatsApp.')
        }
  }
}
