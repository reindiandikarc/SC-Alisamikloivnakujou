// Plugin: doaharian
// Auto-generated from Alya V12
// Commands: doaharian

const path = require('path')

module.exports = {
  command: ["doaharian"],
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

        let src = JSON.parse(fs.readFileSync('./database/doaharian.json', 'utf-8'))
        let caption = src.map((v, i) => {
            return `
    *${i + 1}.* ${v.title}

    ❃ Latin :
    ${v.latin}

    ❃ Arabic :
    ${v.arabic}

    ❃ Translate :
    ${v.translation}
    `.trim()
        }).join('\n\n')
        replyalya(`${caption}`)

    }
  }
