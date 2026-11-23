// Plugin: sampah
// Auto-generated from Alya V12
// Commands: sampah

const path = require('path')

module.exports = {
  command: ["sampah"],
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
    const rewards = {
        exp: 500,
        money: 20999,
    }

    const cooldown = 2592000000
        let userAlt = global.db.users[m.sender]
        if (new Date - user.lastmonthly < cooldown) return reply( `You have already claimed this monthly claim, wait for *${((user.lastmonthly + cooldown) - new Date()).toTimeString()}*`.trim())
        let textAlt = ''
        for (let reward of Object.keys(rewards)) if (reward in user) {
            user[reward] += rewards[reward]
            text += `*+${rewards[reward]}* ${rpg.emoticon(reward)}${reward}\n`
        }
        reply('*––––––『 NYAMPAH 』––––––*\n' + textAlt.trim())
        user.lastmonthly = new Date * 1
    }

    //==================================================================
  }
