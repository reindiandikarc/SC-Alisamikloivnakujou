// Plugin: addalya
// Auto-generated from Alya V12
// Commands: addalya

const path = require('path')

module.exports = {
  command: ["addalya"],
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
    if (!args[0]) return replyalya(`Use ${prefix+command} number\nExample ${prefix+command} 6283166570663`)
    prrkek = q.split("|")[0].replace(/[^0-9]/g, '')+`@s.whatsapp.net`
    let ceknya = await alya.onWhatsApp(prrkek)
    if (ceknya.length == 0) return replyalya(`Masukkan nomor yang valid dan terdaftar di WhatsApp!!!`)
    prem.push(prrkek)
    fs.writeFileSync('./database/alyas.json', JSON.stringify(prem))
    replyalya(`The Number ${prrkek} Has Been PT Jasher!`)
  }
}
