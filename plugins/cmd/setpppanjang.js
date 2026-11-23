// Plugin: setpppanjang
// Fixed for Alya V13
// Commands: setpppanjang

const path = require('path')

module.exports = {
  command: ["setpppanjang"],
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

    let qAlt = m.quoted ? m.quoted : m
    let mimeAlt = (qAlt.msg || qAlt).mimetype || qAlt.mediaType || ''

    if (/image/g.test(mime) && !/webp/g.test(mime)) {
      try {
        const media = await alya.downloadAndSaveMediaMessage(m)
        let botNum = alya.decodeJid(alya.user.id)
        let { img } = await pepe(media)

        await alya.query({
          tag: 'iq',
          attrs: {
            to: botNum,
            type: 'set',
            xmlns: 'w:profile:picture'
          },
          content: [{
            tag: 'picture',
            attrs: { type: 'image' },
            content: img
          }]
        })

        replyalya('✅ Sukses mengganti PP Bot (panjang)')
      } catch (e) {
        console.log(e)
        replyalya('❌ Terjadi kesalahan, coba lagi nanti.')
      }
    } else {
      replyalya(`Kirim gambar dengan caption *${command}* atau reply gambar`)
    }
  }
}
