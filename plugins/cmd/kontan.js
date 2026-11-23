// Plugin: kontan
// Auto-generated from Alya V12
// Commands: kontan

const path = require('path')

module.exports = {
  command: ["kontan"],
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
    KontanNews().then(async (res) => {
    iwannnnnnnnnnnnnnn = ""
    no = 0
    for (let i of res) {
    no += 1
    iwannnnnnnnnnnnnnn += `\n• ${no.toString()} •\n`
    iwannnnnnnnnnnnnnn += `Berita: ${i.berita}\n`
    iwannnnnnnnnnnnnnn += `Jenis: ${i.berita_jenis}\n`
    iwannnnnnnnnnnnnnn += `Upload: ${i.berita_diupload}\n`
    iwannnnnnnnnnnnnnn += `Link: ${i.berita_url}\n`
    }
    iwannnnnnnnnnnnnnn += ""
    alya.sendMessage(m.chat, { image : { url : res[0].berita_thumb }, caption: iwannnnnnnnnnnnnnn }, { quoted:m })
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
