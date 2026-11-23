// Plugin: threads
// Commands: threads, tdl, threadsdl, threaddl
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['threads', 'tdl', 'threadsdl', 'threaddl'],
  tags: ['download'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

if (!text)
    return replyalya(`📌 Contoh: ${prefix + command} https://www.threads.net/@user/post/...`)

  await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    const axios = require('axios')
    const { threadsdl } = require('./scrape/threads')
    const data = await threadsdl(text)

    if (!data.media.length) throw 'Media tidak ditemukan'

    const username = data.author.username || '-'
    const captionPost = data.author.caption || '-'

    const videos = data.media.filter(m => m.type === 'video')
    const images = data.media.filter(m => m.type === 'image')
    const audios = data.media.filter(m => m.mp3)

    if (videos.length) {
      for (let i = 0; i < videos.length; i++) {
        const videoUrl = videos[i].download

        const res = await axios.get(videoUrl, {
          responseType: 'arraybuffer',
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        })

        await alya.sendMessage(
          m.chat,
          {
            video: Buffer.from(res.data),
            mimetype: 'video/mp4',
            fileName: `threads_${i + 1}.mp4`,
            caption:
`🎥 *Threads Video*
👤 Username : @${username}

📝 Deskripsi :
${captionPost}

📦 Video ${i + 1} dari ${videos.length}
⚙️ Powered by : ${botname}`,
            buttons: audios.length && i === 0
              ? [
                  {
                    buttonId: `${prefix}threadaudio ${text}`,
                    buttonText: { displayText: '🎵 Ambil Audio' },
                    type: 1
                  }
                ]
              : [],
            headerType: 4
          },
          { quoted: m }
        )
      }

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
`🧵 *Threads Post*
👤 Username : @${username}

📝 Deskripsi :
${captionPost}

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

      await alya.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
      await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
      return
    }

    throw 'Tipe media tidak dikenali'

  } catch (err) {
    console.error(err)
    await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    replyalya('❌ Gagal mengambil media Threads.')
  }
  }
};
