// Plugin: family100
// Auto-generated from Alya V12
// Commands: family100

const path = require('path')

module.exports = {
  command: ["family100"],
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
      let winScore = 10000
     let id = m.chat
    	if (id in alya.family100) return replyalya('Masih Ada Sesi Yang Belum Diselesaikan!')
     let src = await (await fetch('https://raw.githubusercontent.com/BochilTeam/database/master/games/family100.json')).json()
    	let json = src[Math.floor(Math.random() * src.length)]
     let hasil = `*Jawablah Pertanyaan Berikut :*\n\nSoal : ${json.soal}\n\nHadiah : 10.000 money\n\nTerdapat *${json.jawaban.length}* Jawaban ${json.jawaban.find(v => v.includes(' ')) ? `(beberapa Jawaban Terdapat Spasi)` : ''}`.trim()
     alya.family100[id] = {
    			id,
    			msg: await replyalya(`${hasil}`),
    			...json,
    			terjawab: Array.from(json.jawaban, () => false),
          winScore,
            }
    }
    //==================================================================
  }
