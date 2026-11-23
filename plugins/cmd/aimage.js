// Plugin: aimage
// Auto-generated from Alya V12
// Commands: aimage

const path = require('path')

module.exports = {
  command: ["aimage"],
  tags: ['ai'],
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

    try {
      if (!isPrem) return replyprem(mess.premium)
    if (global.keyopenai === '') return replyalya("Apike Anda Limit");
    if (!q) return replyalya(`Generate image from AI.\n\nContoh:\n${prefix + command} Cowok Naik Kuda`)
    const { Configuration, OpenAIApi } = require('openai')
    const configuration = new Configuration({
    apiKey: global.keyopenai,
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createImage({
    prompt: text,
    n: 1,
    size: "512x512",
    });
    //console.log(response.data.data[0].url)
    alya.sendImage(from, response.data.data[0].url, text, m);
    } catch (err) {
    console.log(err);
    replyalya("Sorry, there seems to be an error :"+ err);
  }
}
}
