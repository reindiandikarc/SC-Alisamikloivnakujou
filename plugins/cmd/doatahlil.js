// Plugin: doatahlil
// Auto-generated from Alya V12
// Commands: doatahlil

const path = require('path')

module.exports = {
  command: ["doatahlil"],
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

        let { result } = JSON.parse(fs.readFileSync('./database/tahlil.json', 'utf-8'))
        let caption = result.map((v, i) => {
            return `
    *${i + 1}.* ${v.title}

    ❃ Arabic :
    ${v.arabic}

    ❃ Translate :
    ${v.translation}
    `.trim()
        }).join('\n\n')
        replyalya(`${caption}`)
    }
  }
