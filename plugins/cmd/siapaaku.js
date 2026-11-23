// Plugin: siapaaku
// Auto-generated from Alya V12
// Commands: siapaaku

const path = require('path')

module.exports = {
  command: ["siapaaku"],
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

      if (!m.isGroup) return replytolak(mess.only.group)
      let users = global.db.users[m.sender]
    	let timeout = 60000
    	let poin = 10000
    	let id = m.chat
    	if (id in alya.siapaaku) return replyalya('Masih ada soal belum terjawab di chat ini')
    	let src = await (await fetch('https://raw.githubusercontent.com/BochilTeam/database/master/games/siapakahaku.json')).json()
    	let json = src[Math.floor(Math.random() * src.length)]
    	let caption = `
    	Soal: ${json.soal}


    	Waktu: *${(timeout / 1000).toFixed(2)} detik*
    	Hadiah: ${poin} Money
    	`.trim()
    	alya.siapaaku[id] = [
    	await replyalya(`${caption}`),
    	json, poin,
    	setTimeout(() => {
    	if (alya.siapaaku[id])
    users.money -= 200
    replyalya(`*GAME SIAPAKAH AKU*\n\nWaktu habis!\n𖦹 Jawabannya adalah; *${json.jawaban}*\n𖦹 Saldo kamu dikurangi 200\n𖦹 Sisa Saldo kamu: *${db.data.users[sender].money.toLocaleString()}*`)
    	delete alya.siapaaku[id]
    	 }, timeout)
    	 ]
    	}
    //==================================================================
  }
