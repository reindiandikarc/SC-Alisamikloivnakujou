// Plugin: delsampah
// Auto-generated from Alya V12
// Commands: delsampah

const path = require('path')

module.exports = {
  command: ["delsampah"],
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

    	let path = require('path');
    	let directoryPath = path.join();
    	fs.readdir(directoryPath, async function (err, files) {
    	if (err) {
    	console.log('Unable to scan directory: ' + err);
    	return reply('Unable to scan directory: ' + err);
    	 }
    	let filteredArray = await files.filter(item => item.endsWith("gif") || item.endsWith("png") || item.endsWith("mp3")  || item.endsWith("mp4") || item.endsWith("jpg") ||item.endsWith("webp") ||item.endsWith("webm") || item.endsWith("opus") || item.endsWith("jpeg"))
    	console.log(filteredArray.length);
    	let teks =`Terdeteksi ${filteredArray.length} file Kenangan <3\n\n`
    	if(filteredArray.length == 0) return reply(`${teks}`)
    	filteredArray.map(function(e, i){
    	teks += (i+1)+`. ${e}\n`
    	})

    	reply(`${teks}`)

    //	await sleep(2000)
    	replyalya("Menghapus file Kenangan...")
    	await filteredArray.forEach(function (file) {
    	fs.unlinkSync(file)
    	});
    	//await sleep(2000)
    	replyalya("Berhasil menghapus semua Kenangan <3")

    	});
  }
}
