// Plugin: paptt
// Auto-generated from Alya V12
// Commands: paptt

const path = require('path')

module.exports = {
  command: ["paptt"],
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

     if (!isPrem) return replyprem(mess.premium)
    global.paptt = [
     "https://telegra.ph/file/5c62d66881100db561c9f.mp4",
     "https://telegra.ph/file/a5730f376956d82f9689c.jpg",
     "https://telegra.ph/file/8fb304f891b9827fa88a5.jpg",
     "https://telegra.ph/file/0c8d173a9cb44fe54f3d3.mp4",
     "https://telegra.ph/file/b58a5b8177521565c503b.mp4",
     "https://telegra.ph/file/34d9348cd0b420eca47e5.jpg",
     "https://telegra.ph/file/73c0fecd276c19560133e.jpg",
     "https://telegra.ph/file/af029472c3fcf859fd281.jpg",
     "https://telegra.ph/file/0e5be819fa70516f63766.jpg",
     "https://telegra.ph/file/29146a2c1a9836c01f5a3.jpg",
     "https://telegra.ph/file/85883c0024081ffb551b8.jpg",
     "https://telegra.ph/file/d8b79ac5e98796efd9d7d.jpg",
     "https://telegra.ph/file/267744a1a8c897b1636b9.jpg",
     ]
    	let url = paptt[Math.floor(Math.random() * paptt.length)]
    	alya.sendFile(m.chat, url, null, 'Tch, dasar sangean', m)
//                 case 'listpc': {
     let anulistp = await store.chats.all().filter(v => v.id.endsWith('.net')).map(v => v.id)
     let teks = `${themeemoji} *PERSONAL CHAT LIST*\n\nTotal Chat : ${anulistp.length} Chat\n\n`
     for (let i of anulistp) {
     let nama = store.messages[i].array[0].pushName
     teks += `${themeemoji} *Name :* ${nama}\n${themeemoji} *User :* @${i.split('@')[0]}\n${themeemoji} *Chat :* https://wa.me/${i.split('@')[0]}\n\n────────────────────────\n\n`
     }
     alya.sendTextWithMentions(m.chat, teks, m)
  }
}
