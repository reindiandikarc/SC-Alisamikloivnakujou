// Plugin: setppbot
// Auto-generated from Alya V12
// Commands: setppbot

const path = require('path')

module.exports = {
  command: ["setppbot"],
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
    if (!quoted) return replyalya(`Kirim/Balas Gambar Dengan Caption ${prefix + command}`)
    if (!/image/.test(mime)) return replyalya(`Kirim/Balas Gambar Dengan Caption ${prefix + command}`)
    if (/webp/.test(mime)) return replyalya(`Kirim/Balas Gambar Dengan Caption ${prefix + command}`)
    var medis = await alya.downloadAndSaveMediaMessage(quoted, 'ppbot.jpeg')
    if (args[0] == `full`) {
    var { img } = await generateProfilePicture(medis)
    await alya.query({
    tag: 'iq',
    attrs: {
    to: botNumber,
    type:'set',
    xmlns: 'w:profile:picture'
    },
    content: [
    {
    tag: 'picture',
    attrs: { type: 'image' },
    content: img
    }
    ]
    })
    fs.unlinkSync(medis)
    replyalya(`Success`)
    } else {
    var memeg = await alya.updateProfilePicture(botNumber, { url: medis })
    fs.unlinkSync(medis)
    replyalya(`Success`)
    }
  }
}
