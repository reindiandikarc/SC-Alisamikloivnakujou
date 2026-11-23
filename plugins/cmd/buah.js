// Plugin: buah
// Auto-generated from Alya V12
// Commands: buah

const path = require('path')

module.exports = {
  command: ["buah"],
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
    	let ini_txt = `[ *GUDANG BUAH KAMU* ]\n\n`
    	ini_txt += `🍌 ${user.pisang} Pisang\n`
    	ini_txt += `🍇 ${user.anggur} Anggur\n`
    	ini_txt += `🥭 ${user.mangga} Mangga\n`
    	ini_txt += `🍊 ${user.jeruk} Jeruk\n`
    	ini_txt += `🍎 ${user.apel} Apel\n\n`
    	ini_txt += `Gunakan command *buah sell* untuk menjual.`
    	replyalya(`${ini_txt}`)
    }
    //==================================================================
  }
