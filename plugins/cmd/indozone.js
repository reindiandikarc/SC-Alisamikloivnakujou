// Plugin: indozone
// Auto-generated from Alya V12
// Commands: indozone

const path = require('path')

module.exports = {
  command: ["indozone"],
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
    IndozoneNews().then(async(res) => {
    no = 0
    iwannnnnn = ""
    for (let i of res) {
    no += 1
    iwannnnnn += `\n• ${no.toString()} •\n`
    iwannnnnn += `Berita: ${i.berita}\n`
    iwannnnnn += `Upload: ${i.berita_diupload}\n`
    iwannnnnn += `Jenis: ${i.berita_jenis}\n`
    iwannnnnn += `Link: ${i.berita_url}\n`
    }
    iwannnnnn += ""
    alya.sendMessage(m.chat, { image : { url : res[0].berita_thumb }, caption: iwannnnnn }, { quoted:m })
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
