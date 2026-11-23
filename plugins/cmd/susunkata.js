// Plugin: susunkata
// Auto-generated from Alya V12
// Commands: susunkata

const path = require('path')

module.exports = {
  command: ["susunkata"],
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

    const db = global.db
      if (!m.isGroup) return replytolak(mess.only.group)
    	let timeout = 60000
    	let poin = 10000
    	let id = m.chat
    	if (id in alya.susunkata) return replyalya('Masih ada soal belum terjawab di chat ini')
    	let src = await (await fetch('https://raw.githubusercontent.com/BochilTeam/database/master/games/susunkata.json')).json()
    	let json = src[Math.floor(Math.random() * src.length)]
    	let caption = `
    	Soal: ${json.soal}
    Tipe: ${json.tipe}

    	Waktu: *${(timeout / 1000).toFixed(2)} detik*
    	Hadiah: ${poin} Money
    	`.trim()
    	alya.susunkata[id] = [
    	await replyalya(`${caption}`),
    	json, poin,
    	setTimeout(() => {
    replyalya(`*GAME SUSUN KATA*\n\nWaktu habis!\n𖦹 Jawabannya adalah; *${json.jawaban}*\n𖦹 Saldo kamu dikurangi 200\n𖦹 Sisa Saldo kamu: *${db.data.users[sender].money.toLocaleString()}*`)
    	delete alya.susunkata[id]
    	 }, timeout)
    	 ]
    	}
    //==================================================================
  }
