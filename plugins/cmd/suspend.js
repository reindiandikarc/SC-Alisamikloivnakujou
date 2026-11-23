// Plugin: suspend
// Auto-generated from Alya V12
// Commands: suspend

const path = require('path')

module.exports = {
  command: ["suspend"],
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

                if (!Ryuu) return replytolak(`Khusus ${global.botname} Ajah`)
                let srv = args[0]
                if (!srv) return reply('ID nya mana?')
                let f = await fetch(domain + "/api/application/servers/" + srv + "/suspend", {
                    "method": "POST",
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + apikey
                    }
                })
                let res = f.ok ? {
                    errors: null
                } : await f.json()
                if (res.errors) return reply('*SERVER NOT FOUND*')
                reply('*BERHASIL SUSPEND..*')
            }
}
