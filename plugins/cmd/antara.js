// Plugin: antara
// Auto-generated from Alya V12
// Commands: antara

const path = require('path')

module.exports = {
  command: ["antara"],
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
    AntaraNews().then(async(res) => {
    no = 0
    iwannnnnnnnnnnnnn = ""
    for (let i of res) {
    no += 1
    iwannnnnnnnnnnnnn += `\n• ${no.toString()} •\n`
    iwannnnnnnnnnnnnn += `Berita: ${i.berita}\n`
    iwannnnnnnnnnnnnn += `Upload: ${i.berita_diupload}\n`
    iwannnnnnnnnnnnnn += `Jenis: ${i.berita_jenis}\n`
    iwannnnnnnnnnnnnn += `Link: ${i.berita_url}\n`
    }
    iwannnnnnnnnnnnnn += ""
    const thumb = res[0].berita_thumb || '';
    alya.sendMessage(m.chat, { image : { url : thumb }, caption: iwannnnnnnnnnnnnn }, { quoted:m })
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
