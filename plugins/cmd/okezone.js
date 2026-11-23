// Plugin: okezone
// Auto-generated from Alya V12
// Commands: okezone

const path = require('path')

module.exports = {
  command: ["okezone"],
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
    OkezoneNews().then(async(res) => {
    no = 0
    iwannnnnnnnnnn = ""
    for (let i of res) {
    no += 1
    iwannnnnnnnnnn += `\n• ${no.toString()} •\n`
    iwannnnnnnnnnn += `Berita: ${i.berita}\n`
    iwannnnnnnnnnn += `Upload: ${i.berita_diupload}\n`
    iwannnnnnnnnnn += `Link: ${i.berita_url}\n`
    }
    iwannnnnnnnnnn += ""
    const thumb = res[0].berita_thumb || '';
    alya.sendMessage(m.chat, { image : { url : thumb }, caption: iwannnnnnnnnnn }, { quoted:m })
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
