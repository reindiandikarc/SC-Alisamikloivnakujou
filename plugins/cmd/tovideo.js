// Plugin: tovideo
// Auto-generated from Alya V12
// Commands: toimg, tovideo

const path = require('path')

module.exports = {
  command: ["toimg", "tovideo"],
  tags: ['sticker'],
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
        let biaya = 2
        if (db.users[m.sender].limit < biaya) {
            return replyalya(`❌ Limit kamu tidak cukup!\n\n💡 Dibutuhkan: ${biaya}`)
        }

        if (!m.quoted) return replyalya('❌ Reply stickernya!')

        let qAlt = m.quoted ? m.quoted : m
        let mimeAlt = (qAlt.msg || q).mimetype || (qAlt.m || q).mimetype || ''

        if (!/webp/.test(mime)) {
            return replyalya(`❌ Balas sticker dengan caption ${prefix + command}`)
        }

        await alya.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

        const fs = require('fs')
        const { exec } = require('child_process')

        try {
            let media = await alya.downloadMediaMessage(q)

            let input = getRandom('.webp')
            let output = command === 'tovideo' ? getRandom('.mp4') : getRandom('.png')

            fs.writeFileSync(input, media)

            exec(`ffmpeg -i ${input} ${output}`, async (err) => {
                fs.unlinkSync(input)

                if (err) {
                    console.log(err)
                    return replyalya('❌ Gagal konversi (Pastikan FFmpeg terinstall)')
                }

                let buffer = fs.readFileSync(output)

                if (command === 'tovideo') {
                    await alya.sendMessage(m.chat, {
                        video: buffer,
                        caption: '✅ Done'
                    }, { quoted: m })
                } else {
                    await alya.sendMessage(m.chat, {
                        image: buffer,
                        caption: '✅ Done'
                    }, { quoted: m })
                }

                fs.unlinkSync(output)
                db.users[m.sender].limit -= biaya
            })

        } catch (e) {
            console.log(e)
            replyalya('❌ Gagal convert.')
        }
  }
}
