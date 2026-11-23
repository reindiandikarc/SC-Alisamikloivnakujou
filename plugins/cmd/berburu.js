// Plugin: berburu
// Auto-generated from Alya V12
// Commands: berburu

const path = require('path')

module.exports = {
  command: ["berburu"],
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
        function clockString(ms) {
      let h = Math.floor(ms / 3600000)
      let m = Math.floor(ms / 60000) % 60
      let s = Math.floor(ms / 1000) % 60
      console.log({ms,h,m,s})
      return [h, m, s].map(v => v.toString().padStart(2, 0) ).join(':')
    }
        let __timers = (new Date - global.db.users[m.sender].lastmisi)
        let _timers = (3600000 - __timers)
        let timers = clockString(_timers)
        let name = alya.getName(m.sender)
        let userAlt = global.db.users[m.sender]
        let id = m.sender
        let kerja = 'Berburu'
        alya.misi = alya.misi ? alya.misi : {}
        if (id in alya.misi) {
            return replyalya( `Selesaikan Misi ${alya.misi[id][0]} Terlebih Dahulu`)
         }
        if (new Date - user.lastmisi > 3600000) {
    		let hewan1 = Math.floor(Math.random() * 10)
    		let hewan2 = Math.floor(Math.random() * 10)
    		let hewan3 = Math.floor(Math.random() * 10)
    		let hewan4 = Math.floor(Math.random() * 10)
    		let hewan5 = Math.floor(Math.random() * 10)
    		let hewan6 = Math.floor(Math.random() * 10)
    		let hewan7 = Math.floor(Math.random() * 10)
    		let hewan8 = Math.floor(Math.random() * 10)
    		let hewan9 = Math.floor(Math.random() * 10)
    		let hewan10 = Math.floor(Math.random() * 10)
    		let hewan11 = Math.floor(Math.random() * 10)
    		let hewan12 = Math.floor(Math.random() * 10)

    		let hsl = `🕸 *Hasil Berburu ${user.registered ? userAlt.name : alya.getName(m.sender)}*
    ${hewan1 ? `
    🐂 Banteng: ${hewan1}` : ''} ${hewan2 ? `
    🐅 Harimau: ${hewan2}` : ''} ${hewan3 ? `
    🐘 Gajah: ${hewan3}` : ''} ${hewan4 ? `
    🐐 Kambing: ${hewan4}` : ''} ${hewan5 ? `
    🐼 Panda: ${hewan5}` : ''} ${hewan6 ? `
    🐊 Buaya: ${hewan6}` : ''} ${hewan7 ? `
    🐃 Kerbau: ${hewan7}` : ''} ${hewan8 ? `
    🐮 Sapi: ${hewan8}` : ''} ${hewan9 ? `
    🐒 Monyet: ${hewan9}` : ''} ${hewan10 ? `
    🐗 Babi Hutan: ${hewan10}` : ''} ${hewan11 ? `
    🐖 Babi: ${hewan11}` : ''} ${hewan12 ? `
    🐓 Ayam: ${hewan12}` : ''}
    `.trim()

    		user.banteng += hewan1
    		user.harimau += hewan2
    		user.gajah += hewan3
    		user.kambing += hewan4
    		user.panda += hewan5
    		user.buaya += hewan6
    		user.kerbau += hewan7
    		user.sapi += hewan8
    		user.monyet += hewan9
    		user.babihutan += hewan10
    		user.babi += hewan11
    		user.ayam += hewan12

    		alya.misi[id] = [
            	kerja,
            setTimeout(() => {
                delete alya.misi[id]
            }, 20000)
        	]

    		setTimeout(() => {
    			replyalya(`${hsl}`)
    		}, 20000)

    		setTimeout(() => {
    			replyalya(`Nah ini dia`)
    		}, 18000)

    		setTimeout(() => {
    			replyalya('Dorr🔥')
    		}, 15000)

    		setTimeout(() => {
    			replyalya('Dapat Sasaran')
    		}, 14000)

    		setTimeout(() => {
    			replyalya('Sedang mencari mangsa...')
    		}, 0)
    		user.lastmisi = new Date * 1
    	} else replyalya(`Silahkan Menunggu Selama ${timers}, Untuk Menyelesaikan Misi Kembali`)
    }

  }
