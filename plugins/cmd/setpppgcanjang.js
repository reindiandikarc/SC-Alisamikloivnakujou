// Plugin: setpppgcanjang
// Auto-generated from Alya V12
// Commands: setpppgcanjang

const path = require('path')

module.exports = {
  command: ["setpppgcanjang"],
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

    const jimp_1 = require('jimp')
    async function pepe(media) {
    	const jimp = await jimp_1.read(media)
    	const min = jimp.getWidth()
    	const max = jimp.getHeight()
    	const cropped = jimp.crop(0, 0, min, max)
    	return {
    		img: await cropped.scaleToFit(720, 720).getBufferAsync(jimp_1.MIME_JPEG),
    		preview: await cropped.normalize().getBufferAsync(jimp_1.MIME_JPEG)
    	}
    }

    	let qAlt = m.quoted ? m.quoted : m
    	let mimeAlt = (qAlt.msg || q).mimetype || qAlt.mediaType || ''
    	if (/image/g.test(mime) && !/webp/g.test(mime)) {
    		try {
    			const media = await alya.downloadAndSaveMediaMessage(quoted)
    			let { img } = await pepe(media)
    			await alya.query({
    				tag: 'iq',
    				attrs: {
    					to: m.chat,
    					type:'set',
    					xmlns: 'w:profile:picture'
    				},
    				content: [
    					{
    						tag: 'picture',
    						attrs: { type: 'image' },
    						content: img
    					}
    				]
    			})
    			reply(`Admin @${(m.sender || '').replace(/@s\.whatsapp\.net/g, '')} telah mengganti Icon Group!`, null, { mentions: [m.sender] })
    		} catch (e) {
    			console.log(e)
    			reply(`Terjadi kesalahan, coba lagi nanti.`)
    		}
    	} else {
    		reply(`Kirim gambar dengan caption *${command}* atau tag gambar yang sudah dikirim`)
    	}
    }
  }
