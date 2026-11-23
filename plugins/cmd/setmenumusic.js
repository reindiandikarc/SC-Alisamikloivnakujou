// Plugin: setmenumusic
// Fixed for Alya V13
// Commands: setmenumusic

const path = require('path')

module.exports = {
  command: ["setmenumusic"],
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

        let qAlt = m.quoted ? m.quoted : m
        let mimeAlt = (qAlt.msg || q).mimetype || ''
        if (!/audio/.test(mime)) return replyalya('❌ Reply audio/musik!')

        try {
            await alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

            const path = require('path')
            const tmp = path.join(__dirname, './tmp/' + Date.now() + '.mp3')

            let media = await qAlt.download()
            fs.writeFileSync(tmp, media)

            let link = null

            try {
                let form = new FormData()
                form.append('reqtype', 'fileupload')
                form.append('fileToUpload', fs.createReadStream(tmp))

                let res = await axios.post(
                    'https://catbox.moe/user/api.php',
                    form,
                    { headers: form.getHeaders(), maxBodyLength: Infinity }
                )

                if (res.data) link = res.data
            } catch {}

            if (!link) {
                try {
                    let form = new FormData()
                    form.append('files[]', fs.createReadStream(tmp))

                    let res = await axios.post(
                        'https://pomf.lain.la/upload.php',
                        form,
                        { headers: form.getHeaders(), maxBodyLength: Infinity }
                    )

                    if (res.data.files?.[0]?.url) {
                        link = 'https://pomf.lain.la/' + res.data.files[0].url
                    }
                } catch {}
            }

            if (!link) {
                try {
                    let form = new FormData()
                    form.append('file', fs.createReadStream(tmp))

                    let res = await axios.post(
                        'https://file.io',
                        form,
                        { headers: form.getHeaders(), maxBodyLength: Infinity }
                    )

                    if (res.data.link) link = res.data.link
                } catch {}
            }

            if (!link) throw 'Semua uploader gagal'

            global.music = link

            let settingsPath = './settings.js'
            let settings = fs.readFileSync(settingsPath, 'utf8')

            let updated = settings.replace(
                /global\.music\s*=\s*['"`](.*?)['"`]/,
                `global.music = '${link}'`
            )

            fs.writeFileSync(settingsPath, updated)
            fs.unlinkSync(tmp)

            await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
            replyalya('✅ Menu music berhasil diubah.')

        } catch (e) {
            console.log(e)
            await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
            replyalya('❌ Upload gagal.')
        }
  }
}
