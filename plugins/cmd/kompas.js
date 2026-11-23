// Plugin: kompas
// Auto-generated from Alya V12
// Commands: kompas

const path = require('path')

module.exports = {
  command: ["kompas"],
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
    KompasNews().then(async(res) => {
    no = 0
    iwannnnnnn = ""
    for (let i of res) {
    no += 1
    iwannnnnnn += `\n• ${no.toString()} •\n`
    iwannnnnnn += `Berita: ${i.berita}\n`
    iwannnnnnn += `Upload: ${i.berita_diupload}\n`
    iwannnnnnn += `Jenis: ${i.berita_jenis}\n`
    iwannnnnnn += `Link: ${i.berita_url}\n`
    }
    iwannnnnnn += ""
    alya.sendMessage(m.chat, { image : { url : res[0].berita_thumb }, caption: iwannnnnnn }, { quoted:m })
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
