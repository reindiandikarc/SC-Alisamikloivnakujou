// Plugin: tempo
// Auto-generated from Alya V12
// Commands: tempo

const path = require('path')

module.exports = {
  command: ["tempo"],
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
    TempoNews().then(async(res) => {
    no = 0
    iwannnnnnnnnnnnn = ""
    for (let i of res) {
    no += 1
    iwannnnnnnnnnnnn += `\n• ${no.toString()} •\n`
    iwannnnnnnnnnnnn += `Berita: ${i.berita}\n`
    iwannnnnnnnnnnnn += `Upload: ${i.berita_diupload}\n`
    iwannnnnnnnnnnnn += `Link: ${i.berita_url}\n`
    }
    iwannnnnnnnnnnnn += ""
    const thumb = res[0].berita_thumb || '';
    alya.sendMessage(m.chat, { image : { url : thumb }, caption: iwannnnnnnnnnnnn }, { quoted:m })
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
