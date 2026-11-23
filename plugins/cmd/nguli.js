// Plugin: nguli
// Auto-generated from Alya V12
// Commands: nguli

const path = require('path')

module.exports = {
  command: ["nguli"],
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

      if (!m.isGroup) return replytolak(mess.only.group)
        if (new Date - global.db.users[m.sender].lastnguli > 86400000) {
          global.db.users[m.sender].limit += 10
          m.reply('_🎉Selamat kamu mendapatkan +10 limit_')
          global.db.users[m.sender].lastnguli = new Date * 1
        } else m.reply('[💬] Anda sudah mengklaim upah nguli hari ini')
      }
    //==================================================================
  }
