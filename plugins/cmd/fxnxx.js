// Plugin: fxnxx
// Auto-generated from Alya V12
// Commands: ceksaldo, fxnxx

const path = require('path')

module.exports = {
  command: ["ceksaldo", "fxnxx"],
  tags: ['nsfw'],
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

        if (!text) return replyalya(`Contoh: ${prefix + command} Ryuu | Keberanian adalah kunci`);

        let [name, ...quoteArr] = text.split('|');
        let quote = quoteArr.join('|').trim();

        if (!quote) {
            name = 'Anonymous';
            quote = text.trim();
        } else {
            name = name.trim();
        }

        await replyalya(mess.wait);

        try {
            const imageBuffer = await fakeXnxx(name, quote);

            await alya.sendMessage(m.chat, {
                image: imageBuffer,
                caption: `*dah ni bang*`
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            reply('❌ Terjadi kesalahan saat memproses gambar.');
        }
//     	case 'alyachatv2': {
        if (!m.isGroup) return replyalya('Fitur Khusus Group!')
        if (!isAdmins && !m.key.fromMe) return replyalya('Fitur Khusus admin!')

        if (args[0] === "on") {
            if (ChatAlya1.includes(m.chat)) return replyalya(`Alya Chat sudah aktif di grup ini, Ryuu.`)
            ChatAlya1.push(m.chat)
            fs.writeFileSync('./database/ChatAlya1.json', JSON.stringify(ChatAlya1, null, 2))
            m.reply('_Successfully Activated Alya Auto Chat!_ ✨\nSekarang Alya akan merespon setiap pesan di grup ini.')
        } else if (args[0] === "off") {
            if (!ChatAlya1.includes(m.chat)) return m.reply(`Alya Chat memang sudah nonaktif.`)
            let anu = ChatAlya.indexOf(m.chat)
            ChatAlya1.splice(anu, 1)
            fs.writeFileSync('./database/ChatAlya1.json', JSON.stringify(ChatAlya1, null, 2))
            delete global.alyaHistory[m.chat]
            replyalya('_Successfully Disabled Alya Auto Chat._')
        } else {
            replyalya(`Contoh: ${prefix + command} on/off`)
// [REMOVED BLOCK]     	case 'nayaai':
  }
}
// [REMOVED BLOCK]
}
// [removed] }
