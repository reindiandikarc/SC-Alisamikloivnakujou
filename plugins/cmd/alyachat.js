// Plugin: alyachat
// Auto-generated from Alya V12
// Commands: alyachat

const path = require('path')

module.exports = {
  command: ["alyachat"],
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

    if (!m.isGroup) return replytolak('Fitur Khusus Group!')
    if (!isAdmins && !Ryuu) return reply('Fitur Khusus admin!')
    if (args[0] === "on") {
    addCountCmd('#alyachat', m.sender, _cmd)
    if (isAlyaChat) return reply(`Udah aktif`)
    ChatAlya.push(m.chat)
    fs.writeFileSync('./database/ChatAlya.json', JSON.stringify(ChatAlya, null, 2))
    reply('_Successfully Activate Alya Chat_')
    } else if (args[0] === "off") {
    addCountCmd('#alyachat', m.sender, _cmd)
    if (!isAlyaChat) return reply(`Udah nonaktif`)
    let anu = ChatAlya.indexOf(m.chat)
    ChatAlya.splice(anu, 1)
    fs.writeFileSync('./database/ChatAlya.json', JSON.stringify(ChatAlya, null, 2))
    reply('_Successfully Disabling Alya Chat_')
    } else {
    replyalya(`Contoh: ${prefix + command} on/off`)
    }

    }
    //=========================================\\=====
  }
