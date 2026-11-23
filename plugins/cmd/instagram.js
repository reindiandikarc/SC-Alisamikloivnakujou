// Plugin: instagram
// Fix: tambah alias 'ig' agar .ig bisa dipakai
// Commands: ig, igdl, instagram
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')

const path = require('path')

module.exports = {
  command: ["ig", "igdl", "instagram"],
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
      let biaya = 2
      if (db.users[m.sender].limit < biaya) {
        return replyalya(`❌ Limit kamu tidak cukup!\n\n💡 Limit dibutuhkan: ${biaya}`)
      }

      if (!text)
        return replyalya(`📌 Contoh: ${prefix + command} https://www.instagram.com/p/...`)

      await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

      try {
        const axios = require('axios')
        const { igdl } = require('../../scrape/igdl')
        const data = await igdl(text)

        if (!data.media.length) throw 'Media tidak ditemukan'

        const videos = data.media.filter(m => m.type === 'video')
        const images = data.media.filter(m => m.type === 'image')

        if (videos.length) {
          for (let i = 0; i < videos.length; i++) {
            const res = await axios.get(videos[i].download, {
              responseType: 'arraybuffer',
              headers: { 'User-Agent': 'Mozilla/5.0' }
            })

            await alya.sendMessage(
              m.chat,
              {
                video: Buffer.from(res.data),
                mimetype: 'video/mp4',
                fileName: `instagram_${i + 1}.mp4`,
                caption:
    `📥 *Instagram Video*
    👤 Request by : @${pushname}

    ⚙️ Powered by : ${botname}`,
                buttons: i === 0 ? [
                  {
                    buttonId: `${prefix}igmp3 ${text}`,
                    buttonText: { displayText: '🎵 ambil audio' },
                    type: 1
                  }
                ] : [],
                headerType: 4
              },
              { quoted: m }
            )
          }

          db.users[m.sender].limit -= biaya

          await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
          return
        }

        if (images.length) {

          const cards = await Promise.all(
            images.map(async (item, i) => ({
              header: proto.Message.InteractiveMessage.Header.create({
                ...(await prepareWAMessageMedia(
                  { image: { url: item.download } },
                  { upload: alya.waUploadToServer }
                )),
                title: '',
                subtitle: `Foto ${i + 1} dari ${images.length}`,
                hasMediaAttachment: false
              }),
              body: { text: '' },
              nativeFlowMessage: { buttons: [] }
            }))
          )

          const msg = generateWAMessageFromContent(
            m.chat,
            {
              viewOnceMessage: {
                message: {
                  interactiveMessage: {
                    body: {
                      text:
    `📸 *Instagram Post*
    👤 Request by : @${pushname}

    📦 Total Media : ${images.length}
    ⚙️ Powered by : ${botname}`
                    },
                    carouselMessage: {
                      cards,
                      messageVersion: 1
                    }
                  }
                }
              }
            },
            { quoted: m }
          )

          await alya.relayMessage(
            m.chat,
            msg.message,
            { messageId: msg.key.id }
          )

          db.users[m.sender].limit -= biaya

          await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
          return
        }

        throw 'Tipe media tidak dikenali'

      } catch (err) {
        console.error(err)
        await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        replyalya('❌ Gagal mengambil media Instagram.')
      }
  }
}
