// Plugin: ocr
// Auto-generated from Alya V12
// Commands: ocr

const path = require('path')

module.exports = {
  command: ["ocr"],
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
      waifuList, husbuList, pler, setting, user,
      UploadFileUgu, mess
    } = ctx

      if (!quoted) return replyalya(`mana fotonya kak?`)
      alya.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key }})
      const media = await alya.downloadAndSaveMediaMessage(quoted)
    const anuu = await UploadFileUgu(media)
    	const data = await fetchJson(`https://api.alyachan.dev/api/ocr?image=${anuu.url}&apikey=nanogembul`)
    	const textnya = data.data.text
    	reply(`${textnya}`)
  }
}
