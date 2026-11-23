// Plugin: autoaigrup
// Auto-generated from Alya V12
// Commands: autoaigrup

const path = require('path')

module.exports = {
  command: ["autoaigrup"],
  tags: ['ai'],
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

    if (!m.isGroup) return replytolak('Fitur Khusus Group!')
    if (!isAdmins && !Ryuu) return reply('Fitur Khusus admin!')
    if (args[0] === "on") {
    addCountCmd('#autoaigrup', m.sender, _cmd)
    if (isAutoAiGc) return reply(`Udah aktif`)
    openaigc.push(m.chat)
    fs.writeFileSync('./database/openaigc.json', JSON.stringify(openaigc, null, 2))
    reply('Successfully Activate Auto AI')
    } else if (args[0] === "off") {
    addCountCmd('#autoaigrup', m.sender, _cmd)
    if (!isAutoAiGc) return reply(`Udah nonaktif`)
    let anu = openaigc.indexOf(m.chat)
    openaigc.splice(anu, 1)
    fs.writeFileSync('./database/openaigc.json', JSON.stringify(openaigc, null, 2))
    reply('Successfully Disabling Auto AI')
    } else {
    reply(`${prefix+command} on -- _mengaktifkan_\n${prefix+command} off -- _Menonaktifkan_`)
    }}
    // ============================================================
    // ALYA V12 - .ai on / .ai off Command (Bell System)
    // ============================================================
  }
