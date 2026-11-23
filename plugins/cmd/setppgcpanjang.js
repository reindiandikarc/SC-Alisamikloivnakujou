// Plugin: setppgcpanjang
// Commands: setppgcpanjang

const path = require('path')

module.exports = {
  command: ["setppgcpanjang"],
  tags: ['owner'],
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

    const Jimp = require('jimp')

    async function pepe(media) {
      const jimp = await Jimp.read(media)
      const min = jimp.getWidth()
      const max = jimp.getHeight()
      const cropped = jimp.crop(0, 0, min, max)
      return {
        img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
        preview: await cropped.normalize().getBufferAsync(Jimp.MIME_JPEG)
      }
    }

    if (!Ryuu) return replytolak(mess.only.owner)
    if (!isGroup) return replytolak(mess.only.group)
    if (!isBotAdmins) return replytolak('_Bot Harus Menjadi Admin Terlebih Dahulu_')

    if (!/image/g.test(mime) && !isQuotedImage) return replyalya(`Kirim gambar dengan caption *${prefix + command}* atau reply gambar`)
    try {
      const media = await alya.downloadAndSaveMediaMessage(quoted || m)
      let { img } = await pepe(media)
      await alya.query({
        tag: 'iq',
        attrs: {
          to: from,
          type: 'set',
          xmlns: 'w:profile:picture'
        },
        content: [{
          tag: 'picture',
          attrs: { type: 'image' },
          content: img
        }]
      })
      fs.unlinkSync(media)
      replyalya('✅ *Sukses mengganti PP Grup (panjang)*')
    } catch (e) {
      console.log(e)
      replyalya('❌ Terjadi kesalahan, coba lagi nanti.')
    }
  }
}
