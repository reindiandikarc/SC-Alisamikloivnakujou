// Plugin: gdrive
// Auto-generated from Alya V12
// Commands: gdrive

const path = require('path')

module.exports = {
  command: ["gdrive"],
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

      if (!args[0]) return replyalya('📌 Masukkan link Google Drive!')
      reply(mess.wait)

      const fg = require('api-dylux')

      function normalizeGDrive(url) {

        let match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
        if (match) return `https://drive.google.com/uc?id=${match[1]}&export=download`

        match = url.match(/id=([a-zA-Z0-9_-]+)/)
        if (match) return `https://drive.google.com/uc?id=${match[1]}&export=download`

        return null
      }

      try {
        const fixedUrl = normalizeGDrive(args[0])
        if (!fixedUrl) throw new Error('Invalid link')

        const res = await fg.GDriveDl(fixedUrl)

        await replyalya(`
    ≡ *Google Drive Downloader*
    ▢ *Nama:* ${res.fileName}
    ▢ *Size:* ${res.fileSize}
    ▢ *Type:* ${res.mimetype}
        `)

        await alya.sendMessage(m.chat, {
          document: { url: res.downloadUrl },
          fileName: res.fileName,
          mimetype: res.mimetype
        }, { quoted: m })

      } catch (err) {
        reply('❌ Gagal download (link private / limit / expired)')
      }
  }
}
