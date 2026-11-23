// Plugin: topixel
// Auto-generated from Alya V12
// Commands: topixel

const path = require('path')

module.exports = {
  command: ["topixel"],
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

      let qAlt = m.quoted ? m.quoted : m
      let mimeAlt = (qAlt.msg || q).mimetype || ''

      if (!mimeAlt.startsWith('image/')) {
        return replytolak('Mana gambarnya? Kirim atau reply foto dengan caption *topixel*')
      }

      let pixelSize = parseInt(args[0]) || 128
      if (pixelSize < 8) pixelSize = 8
      if (pixelSize > 1024) pixelSize = 1024

      replyalya('Tunggu sebentar, sedang diproses...')

      try {
        const media = await qAlt.download()
        const image = await Jimp.read(media)
        const small = image.clone().resize(pixelSize, pixelSize, Jimp.RESIZE_NEAREST_NEIGHBOR)
        const pixelated = small.resize(image.bitmap.width, image.bitmap.height, Jimp.RESIZE_NEAREST_NEIGHBOR)
        const buffer = await pixelated.getBufferAsync(Jimp.MIME_JPEG)

        await alya.sendMessage(m.chat, {
          image: buffer,
          caption: `Pixelated image (size: ${pixelSize})`
        }, { quoted: m })
      } catch (e) {
        replytolak('Gagal memproses gambar: ' + e.message)
      }
  }
}
