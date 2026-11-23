// Plugin: setppgroup
// Auto-generated from Alya V12
// Commands: setppgroup, setppgc, setgcpp, setgrouppp

const path = require('path')

module.exports = {
  command: ["setppgroup", "setppgc", "setgcpp", "setgrouppp"],
  tags: ['group'],
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

    if (!m.isGroup) return replytolak(mess.only.group)
    if (!isAdmins && !Ryuu) return reply('Khusus Admin!!')
    if (!isBotAdmins) return replytolak('_Bot Harus Menjadi Admin Terlebih Dahulu_')
    if (!quoted) return replyalya(`Where is the picture?`)
    if (!/image/.test(mime)) return replyalya(`Kirim/Balas Gambar Dengan Caption ${prefix + command}`)
    if (/webp/.test(mime)) return replyalya(`Kirim/Balas Gambar Dengan Caption ${prefix + command}`)
    var mediz = await alya.downloadAndSaveMediaMessage(quoted, 'ppgc.jpeg')
    if (args[0] == `full`) {
    var { img } = await generateProfilePicture(mediz)
    await alya.query({
    tag: 'iq',
    attrs: {
    to: m.chat,
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
    fs.unlinkSync(mediz)
    replyalya(`Success`)
    } else {
    var memeg = await alya.updateProfilePicture(m.chat, { url: mediz })
    fs.unlinkSync(mediz)
    replyalya(`Success`)
    }
  }
}
