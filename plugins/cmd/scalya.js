// Plugin: scalya
// Auto-generated from Alya V12
// Commands: scalya

const path = require('path')

module.exports = {
  command: ["scalya"],
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
    			const axios = require('axios');
    			const fetch = require('node-fetch');
    			const cheerio = require('cheerio');

    			const mediafireLink = 'https://www.mediafire.com/file/i0f8pj4bhch7c5k/ALYA+V10.zip/file';

    			await alya.sendMessage(m.chat, { react: { text: "⏱️", key: m.key } });

    			const { data } = await axios.get(mediafireLink);
    			const $ = cheerio.load(data);

    			let directLink = $('#downloadButton').attr('href');
    			let fileSize = $('a#downloadButton').text().replace(/[\t\n]/g, '').replace('Download', '').replace('(', '').replace(')', '').trim();

    			if (!directLink) return m.reply('❌ Gagal menemukan link download MediaFire.');

    			let fileName = decodeURIComponent(directLink.split('/').pop().split('?')[0]);

    			const res = await fetch(directLink);
    			const fileBuffer = await res.arrayBuffer();

    			await alya.sendMessage(
    				m.chat,
    				{
    					document: Buffer.from(fileBuffer),
    					fileName: fileName,
    					mimetype: 'application/zip',
    					caption: `*「 S C A L Y A 」*

    📄 *Nama File:* ${fileName}
    ⚖️ *Ukuran:* ${fileSize || 'Tidak diketahui'}
    🔗 *Source:* ${mediafireLink}

    _File sukses terkirim..._`
    				},
    				{ quoted: m }
    			);
    			await alya.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    		} catch (err) {
    			console.error(err);
    			m.reply('❌ Terjadi kesalahan saat memproses file.\nError: ' + err.message);
    			await alya.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    		}
    	}
}
