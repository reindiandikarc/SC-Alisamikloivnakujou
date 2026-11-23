// Plugin: kolam
// Auto-generated from Alya V12
// Commands: kolam

const path = require('path')

module.exports = {
  command: ["kolam"],
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
    let userAlt = global.db.users[m.sender]
    let past = `
    ╭━━━━「 *BIO* 」
    ┊ *💌 Name :* ${user.registered ? userAlt.name : alya.getName(m.sender)}
    ┊ *📊 Level :* ${userAlt.level}
    ┊ *✨ Exp :* ${userAlt.exp}
    ╰═┅═━––––––─ׄ✧

    ╭━━━━「 *ISI* 」
    ┊🦀 Kepiting: ${user.kepiting}
    ┊🦞 Lobster: ${user.lobster}
    ┊🦐 Udang: ${user.udang}
    ┊🦑 Cumi: ${user.cumi}
    ┊🐙 Gurita: ${user.gurita}
    ┊🐡 Buntal: ${user.buntal}
    ┊🐠 Dory: ${user.dory}
    ┊🐳 Orca: ${user.orca}
    ┊🐬 Lumba: ${user.lumba}
    ┊🐋 Paus: ${user.paus}
    ┊🦈 Hiu: ${user.hiu}
    ╰═┅═━––––––─ׄ✧
    🎏 Total Isi: *${user.kepiting + user.lobster + user.udang + user.cumi + user.gurita + user.buntal + user.dory + user.orca + user.lumba + user.paus + user.hiu}* Jenis`
      m.reply(past)
      }
    //==================================================================
  }
