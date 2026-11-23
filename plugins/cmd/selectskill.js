// Plugin: selectskill
// Auto-generated from Alya V12
// Commands: selectskill

const path = require('path')

module.exports = {
  command: ["selectskill"],
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
    let skill = ["swordmaster", "necromancer", "witch", "Archer", "magicswordmaster", "thief", "shadow"]
    let bintang = {
    "satu": "⭐",
    "dua": "⭐⭐",
    "tiga": "⭐⭐⭐",
    "empat": "⭐⭐⭐⭐",
    "lima": "⭐⭐⭐⭐⭐",
    "Enam": "⭐⭐⭐⭐⭐⭐"
    }
       let skil = text.trim().toLowerCase() // to filter text
       if (!skill.includes(skil)) return reply( `Select *skill🃏* what do you want/pilih skill apa yg kamu inginkan:

    ${skill.map(skil => `› ${skil}`).join('\n')}

    How To use/Cara menggunakan:
    ${command} <nameskill>

    Example/Contoh:
    ${command} necromancer
    `)
        if (user.skill == "") {
            user.skill = skil
            m.reply(`Anda telah memilih Skill ${skil}`)
        } else if (user.skill) {
            m.reply(`Anda Sudah Punya skill ${user.skill} Tidak bisa diganti`)
        }
    }
    //==================================================================
  }
