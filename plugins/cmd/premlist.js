// Plugin: premlist
// Auto-generated from Alya V12
// Commands: hargasewa, premlist

const path = require('path')

module.exports = {
  command: ["hargasewa", "premlist"],
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

    if (!Ryuu) return replytolak(mess.owner)
    let listprem =`*LIST SELER ${global.botname}*\n\nTotal Seller : ${owner.length}\n`
    var no = 1
    for (let x of owner) {
    listprem +=`\nUser: ${no++}\nID: ${x}\n\n`
    }
    listprem +=`Untuk Menghapus Akses Prem Ketik ${prefix}delprem 628xxx/@tag`
    alya.sendMessage(m.chat, {text: listprem },{quoted: alya.chat})
  }
}
