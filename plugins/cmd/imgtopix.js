// Plugin: imgtopix
// Auto-generated from Alya V12
// Commands: imgtopix

const path = require('path')

module.exports = {
  command: ["imgtopix"],
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

        try {
            // ambil gambar dari reply atau pesan langsung
            let q = m.quoted ? m.quoted : m
            let mime = (q.msg || q).mimetype || ''
            if (!/image/.test(mime)) return replyalya(`Reply gambar dengan caption *${prefix+command}* (1:1|3:2|2:3)`)

            // ambil rasio (default 1:1)
            let ratio = (args[0] || '1:1').trim()
            if (!['1:1','3:2','2:3'].includes(ratio)) return replyalya('Rasio yang tersedia hanya: 1:1, 3:2, 2:3')

            // download gambar
            let media = await downloadContentFromMessage(q.msg || q, 'image')
            let buffer = Buffer.from([])
            for await (const chunk of media) buffer = Buffer.concat([buffer, chunk])

            // upload gambar ke PixelArt API
            const { data: a } = await axios.post('https://pixelartgenerator.app/api/upload/presigned-url', {
                filename: `alya_${Date.now()}.jpg`,
                contentType: 'image/jpeg',
                type: 'pixel-art-source'
            }, {
                headers: {
                    'content-type': 'application/json',
                    referer: 'https://pixelartgenerator.app/',
                    'user-agent': 'Mozilla/5.0'
                }
            })

            await axios.put(a.data.uploadUrl, buffer, {
                headers: { 'content-type': 'image/jpeg', 'content-length': buffer.length }
            })

            // minta generate pixel
            const { data: b } = await axios.post('https://pixelartgenerator.app/api/pixel/generate', {
                imageKey: a.data.key,
                prompt: '',
                size: ratio,
                type: 'image'
            }, {
                headers: {
                    'content-type': 'application/json',
                    referer: 'https://pixelartgenerator.app/',
                    'user-agent': 'Mozilla/5.0'
                }
            })

            // cek status sampai selesai
            let url
            while (true) {
                const { data } = await axios.get(`https://pixelartgenerator.app/api/pixel/status?taskId=${b.data.taskId}`, {
                    headers: {
                        'content-type': 'application/json',
                        referer: 'https://pixelartgenerator.app/',
                        'user-agent': 'Mozilla/5.0'
                    }
                })
                if (data.data.status === 'SUCCESS') {
                    url = data.data.images[0]
                    break
                }
                await sleep(1000)
            }

            // kirim hasil
            await alya.sendMessage(m.chat, {
                image: { url },
                caption: `✅ Sukses convert ke pixel art dengan rasio *${ratio}*`
            }, { quoted: m })

        } catch (e) {
            console.log(e)
            replytolak(`Terjadi kesalahan: ${e.message}`)
        }
  }
}
