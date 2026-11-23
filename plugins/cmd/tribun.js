// Plugin: tribun
// Auto-generated from Alya V12
// Commands: tribun

const path = require('path')

module.exports = {
  command: ["tribun"],
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
    TribunNews().then(async(res) => {
    no = 0
    iwannnnn = ""
    for (let i of res) {
    no += 1
    iwannnnn += `\n• ${no.toString()} •\n`
    iwannnnn += `Berita: ${i.berita}\n`
    iwannnnn += `Upload: ${i.berita_diupload}\n`
    iwannnnn += `Jenis: ${i.berita_jenis}\n`
    iwannnnn += `Link: ${i.berita_url}\n`
    }
    iwannnnn += ""
    alya.sendMessage(m.chat, { image : { url : res[0].berita_thumb }, caption: iwannnnn }, { quoted:m })
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
