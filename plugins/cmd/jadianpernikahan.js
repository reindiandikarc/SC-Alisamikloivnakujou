// Plugin: jadianpernikahan
// Auto-generated from Alya V12
// Commands: jadianpernikahan

const path = require('path')

module.exports = {
  command: ["jadianpernikahan"],
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

    if (!text) return reply(`Contoh : ${prefix + command} 6, 12, 2020`)
    let [tgl, bln, thn] = text.split`,`
    let anu = await primbon.tanggal_jadian_pernikahan(tgl, bln, thn)
    if (anu.status == false) return reply(anu.message)
    reply(`• *Tanggal Pernikahan :* ${anu.message.tanggal}\n• *karakteristik :* ${anu.message.karakteristik}`)
  }
}
