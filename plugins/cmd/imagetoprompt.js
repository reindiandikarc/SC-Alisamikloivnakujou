// Plugin: imagetoprompt
// Auto-generated from Alya V12
// Commands: img2prompt, imagetoprompt

const path = require('path')

module.exports = {
  command: ["img2prompt", "imagetoprompt"],
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

      const axios = require('axios')
      const FormData = require('form-data')

      if (!m.quoted)
        return replyalya(`🖼️ *Balas gambar yang ingin dianalisa*

    📌 Contoh:
    Reply gambar lalu ketik:
    *${prefix + command}*`)

      let mimeAlt = m.quoted.mimetype || ""
      if (!/image\/(jpe?g|png)/.test(mime))
        return replyalya(`❌ *Format tidak didukung!*

    📄 Format yang didukung:
    • JPG
    • PNG`)

      replyalya(`⏳ *Menganalisa Gambar...*

    👤 *Pengguna* : ${pushname}
    🧠 *AI Engine* : Image to Prompt
    📤 *Status* : Upload & Analisis

    Mohon tunggu sebentar...`)

      try {

        let imgBuffer = await m.quoted.download()

        const form = new FormData()
        form.append("file", imgBuffer, {
          filename: "image.jpg",
          contentType: mime
        })

        let upload = await axios.post(
          "https://tmpfiles.org/api/v1/upload",
          form,
          { headers: form.getHeaders() }
        )
        let imageUrl = upload.data.data.url.replace(
          "tmpfiles.org/",
          "tmpfiles.org/dl/"
        )
        let apiUrl = `https://api.deline.web.id/ai/toprompt?url=${encodeURIComponent(imageUrl)}`
        let { data } = await axios.get(apiUrl)

        if (!data.status)
          return replyalya('❌ *Gagal mengambil prompt dari gambar!*')

        let res = data.result

        let teks = `🎨 *IMAGE TO PROMPT*

    🧠 *Prompt Original* :
    ${res.original}

    🌐 *Terjemahan ID* :
    ${res.translated}

    ━━━━━━━━━━━━━━━━━━━━━
    🚀 *Powered By ${botname}*
    ━━━━━━━━━━━━━━━━━━━━━`

        replyalya(teks)

      } catch (err) {
        console.error(err)
        replyalya(`❌ *IMAGE TO PROMPT GAGAL*

    👤 *Request By* : ${pushname}

    🔧 Kemungkinan penyebab:
    • Server AI sibuk
    • File gambar rusak
    • Koneksi error

    ━━━━━━━━━━━━━━━━━━━━━━
    🚀 *Powered By ${botname}*
    ━━━━━━━━━━━━━━━━━━━━━━`)
      }
    }
//     	case 'threads':
  }
