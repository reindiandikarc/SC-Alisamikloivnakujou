// Plugin: teraboxdl
// Auto-generated from Alya V12
// Commands: terabox, teraboxdl

const path = require('path')

module.exports = {
  command: ["terabox", "teraboxdl"],
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

      if (!text)
        return replyalya(
          `❌ Masukkan link TeraBox\n\nContoh:\n${prefix + command} https://terabox.com/s/xxxxx`
        )

      alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

      const axios = require('axios')

      async function teraboxdl(url) {
        try {
          if (!url.includes('/s/') && !url.includes('surl'))
            throw new Error('Invalid url.')

          // bypass CF Turnstile
          const { data: cf } = await axios.post(
            'https://api.nekolabs.web.id/tools/bypass/cf-turnstile',
            {
              url: 'https://teraboxdl.site/',
              siteKey: '0x4AAAAAACG0B7jzIiua8JFj'
            }
          )

          if (!cf?.result) throw new Error('Failed to get cf token.')

          const { data } = await axios.post(
            'https://teraboxdl.site/api/proxy',
            {
              url: url,
              cf_token: cf.result
            },
            {
              headers: {
                origin: 'https://teraboxdl.site',
                referer: 'https://teraboxdl.site/',
                'user-agent':
                  'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
              }
            }
          )

          return data
        } catch (err) {
          throw new Error(err.message)
        }
      }

      try {
        const res = await teraboxdl(text)

        if (!res?.files?.length)
          return replyalya('❌ File tidak ditemukan')

        let msg = `📦 *TeraBox Downloader*\n\n`
        msg += `📊 Total File : ${res.files.length}\n\n`

        res.files.forEach((v, i) => {
          msg += `*${i + 1}. ${v.name}*\n`
          msg += `📁 Type : ${v.type || '-'}\n`
          msg += `📦 Size : ${v.size || '-'}\n`
          msg += `🔗 Download:\n${v.download}\n\n`
        })

        msg += `📝 Jangan download yg aneh2 pake terabox ini ya bujank`

        replyalya(msg)
        alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
      } catch (e) {
        console.error(e)
        replyalya('❌ Gagal download TeraBox')
        alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      }
    }
    //==================================================================
  }
