// Plugin: waifucheck
// Auto-generated from Alya V12
// Commands: waifucheck

const path = require('path')

module.exports = {
  command: ["waifucheck"],
  tags: ['romance'],
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

    cantik = body.slice(1)
    const okebnh1 =['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','60','61','62','63','64','65','66','67','68','69','70','71','72','73','74','75','76','77','78','79','80','81','82','83','84','85','86','87','88','89','90','91','92','93','94','95','96','97','98','99','100']
    const xeonkak = okebnh1[Math.floor(Math.random() * okebnh1.length)]
    alya.sendMessage(m.chat, { text: xeonkak }, { quoted: m })
//         case 'coffee': case 'kopi': {
    alya.sendMessage(m.chat, {caption: mess.success, image: { url: 'https://coffee.alexflipnote.dev/random' }}, { quoted: m })
//                 case 'wallpaper': {
    if (!text) return replyalya('Enter Query Title')
    reply(mess.wait)
    		let { wallpaper } = require('../../lib/scraper')
    anuwallpep = await wallpaper(text)
    result = anuwallpep[Math.floor(Math.random() * anuwallpep.length)]
    alya.sendMessage(m.chat, {caption: `${themeemoji} Title : ${result.title}\n${themeemoji} Category : ${result.type}\n${themeemoji} Detail : ${result.source}\n${themeemoji} Media Url : ${result.image[2] || result.image[1] || result.image[0]}`, image: { url: result.image[0] }} , { quoted: m })
// [REMOVED]                 case 'wikimedia': {
    if (!text) return replyalya('Enter Query Title')
    reply(mess.wait)
    		let { wikimedia } = require('../../lib/scraper')
    let anumedia = await wikimedia(text)
    result = anumedia[Math.floor(Math.random() * anumedia.length)]
    alya.sendMessage(m.chat, {caption: `${themeemoji} Title : ${result.title}\n${themeemoji} Source : ${result.source}\n${themeemoji} Media Url : ${result.image}`, image: { url: result.image }} , { quoted: m })
// [REMOVED]                 case 'pick': {
                	if (!m.isGroup) return replytolak(mess.only.group)
                	if (!text) return replyalya(`What do you want to pick?\nExample: ${prefix + command} idiot`)
                 let groupMetadata_local = m.isGroup ? await alya.groupMetadata(m.chat)
     .catch((e) => {}) : ""
                 const participants = m.isGroup ? await groupMetadata_local.participants : ""
                 let member = participants.map((u) => u.id)
                 let me = m.sender
                 let xeonshimts = member[Math.floor(Math.random() * member.length)]
                 alya.sendMessage(from, {
    text: `The most *${text}* here is *@${xeonshimts.split("@")[0]}*`,
    contextInfo:{
    forwardingScore: 9999999,
    isForwarded: true,
    mentionedJid:[xeonshimts]
    }
    }, { quoted: m })
  }
}
