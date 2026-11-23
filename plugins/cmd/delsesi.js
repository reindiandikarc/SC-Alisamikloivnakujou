// Plugin: delsesi
// Auto-generated from Alya V12
// Commands: delsesi

const path = require('path')

module.exports = {
  command: ["delsesi"],
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

    fs.readdir("./Alyachan", async function (err, files) {
    if (err) {
    console.log('Unable to scan directory: ' + err);
    return replyalya('Unable to scan directory: ' + err);
    }
    let filteredArray = await files.filter(item => item.startsWith("pre-key") ||
    item.startsWith("sender-key") || item.startsWith("session-") || item.startsWith("app-state")
       )
    console.log(filteredArray.length);
    let teks =`Terdeteksi ${filteredArray.length} file kenangan <3\n\n`
    if(filteredArray.length == 0) return replyalya(`${teks}`)
    filteredArray.map(function(e, i){
    teks += (i+1)+`. ${e}\n`
    })
    replyalya(`${teks}`)
    await sleep(2000)
    replyalya("Menghapus file Kenangan...")
    await filteredArray.forEach(function (file) {
    fs.unlinkSync(`./Alyachan/${file}`)
    });
    await sleep(2000)
    replyalya("Berhasil menghapus semua Kenangan di folder session")
    });
    }
    //================================================================
  }
