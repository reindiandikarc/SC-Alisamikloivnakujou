// Plugin: upvn
// Auto-generated from Alya V12
// Commands: upvn

const path = require('path')

module.exports = {
  command: ["upvn"],
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

    const db = global.db
    if (!Ryuu) return replytolak(`Ngapain ? Fitur Ini Khusus Tuan Saya😜`)
    function getRandomHexColor() {
      return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
    }
    const media = await alya.downloadAndSaveMediaMessage(quoted)
    alya.sendMessage('status@broadcast', {audio: { url: media }, mimetype: 'audio/mp3', ptt:true },{
    backgroundColor: getRandomHexColor(),
    statusJidList: Object.keys(db.users)
    });
    }
//     reply(`*Sukses mengirim status whatsapp ke  Orang Yang Ada Di database*`)
    //==================================================================
  }
