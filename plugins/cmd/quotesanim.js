// Plugin: quotesanim
// Auto-generated from Alya V12
// Commands: quotesanim

const path = require('path')

module.exports = {
  command: ["quotesanim"],
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

      let res = await (await fetch('https://katanime.vercel.app/api/getrandom?limit=1'))
      if (!res.ok) return await res.text()
      let json = await res.json()
      if(!json.result[0]) return json
      let { indo, character, anime } = json.result[0]
      reply(`${indo}\n\n📮By:  _${character}_ \nAnime:\n${anime}`)
    }
    //=========================================\\======
  }
