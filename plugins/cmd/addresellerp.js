// Plugin: addresellerp
// Auto-generated from Alya V12
// Commands: addresellerp

const path = require('path')

module.exports = {
  command: ["addresellerp"],
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

    if (!Ryuu && !isAdminP && !isPT && !isOwn) return replyalya(mess.only.owner)
    if (!args[0]) return replyalya(`Use ${prefix+command} number\nExample ${prefix+command} 6283166570663`)
    prrkek = q.split("|")[0].replace(/[^0-9]/g, '')+`@s.whatsapp.net`
    let ceknya = await alya.onWhatsApp(prrkek)
    if (ceknya.length == 0) return replyalya(`Masukkan nomor yang valid dan terdaftar di WhatsApp!!!`)
    resellerp.push(prrkek)
    fs.writeFileSync('./database/resellerpanel.json', JSON.stringify(resellerp))
    replyalya(`Woah Lu ${prrkek} Jadi Reseller Panel!`)
  }
}
