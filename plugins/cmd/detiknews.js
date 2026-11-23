// Plugin: detiknews
// Auto-generated from Alya V12
// Commands: detiknews

const path = require('path')

module.exports = {
  command: ["detiknews"],
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

      try {
    DetikNews().then(async(res) => {
    no = 0
    iwannnnnnnn = ""
    for (let i of res) {
    no += 1
    iwannnnnnnn += `\n• ${no.toString()} •\n`
    iwannnnnnnn += `Berita: ${i.berita}\n`
    iwannnnnnnn += `Upload: ${i.berita_diupload}\n`
    iwannnnnnnn += `Link: ${i.berita_url}\n`
    }
    iwannnnnnnn += ""
    alya.sendMessage(m.chat, { image : { url : res[0].berita_thumb }, caption: iwannnnnnnn }, { quoted:m })
       }).catch(err => {
                console.error(err);
                reply('Terjadi kesalahan saat mengambil berita.');
            });
        } catch (err) {
            console.error(err);
            reply('Terjadi kesalahan yang tidak terduga.');
        }
    }
    //=================================================//
  }
