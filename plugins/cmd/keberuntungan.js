// Plugin: keberuntungan
// Auto-generated from Alya V12
// Commands: keberuntungan

const path = require('path')

module.exports = {
  command: ["keberuntungan"],
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

    if (!text) return reply(`Contoh : ${prefix + command} Dika, 7, 7, 2005`)
    let [nama, tgl, bln, thn] = text.split`,`
    let anu = await primbon.potensi_keberuntungan(nama, tgl, bln, thn)
    if (anu.status == false) return reply(anu.message)
    reply(`• *Nama :* ${anu.message.nama}\n• *Lahir :* ${anu.message.tgl_lahir}\n• *Hasil :* ${anu.message.result}`)
  }
}
