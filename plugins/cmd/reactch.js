// Plugin: reactch
// Auto-generated from Alya V12
// Commands: reactch

const path = require('path')

module.exports = {
  command: ["reactch"],
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
      if (!text)
        return replyalya(
          `❌ Masukkan link channel & emoji\n\nContoh:\n${prefix + command} https://whatsapp.com/channel/xxxxx 😹🥺😂`
        )

      let argsAlt = text.split(' ')
      let link = args[0]
      let emoji = argsAlt.slice(1).join('')

      if (!link)
        return replyalya('❌ Link channel tidak valid')
      if (!emoji)
        return replyalya('❌ Format emoji salah\nContoh: 😱🥺😂')

      alya.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

      try {
        let emojis = Array.from(emoji).join(',')

        let { data } = await axios.get(
          `https://api.fikmydomainsz.xyz/tools/reactchannel?link=${link}&emojis=${encodeURIComponent(emojis)}`
        )

        if (!data.status)
          return replyalya(data.error || '❌ Gagal memberi reaction')

        let msg = `✨ *Reaction Successfully!*\n\n`
        msg += `📢 *Channel* : ${data.links}\n`
        msg += `😹 *Emoji*   : ${data.emojis}\n\n`
        msg += `> ${data.kwontol}`

        replyalya(msg)
      } catch (err) {
        if (err.response?.status === 429)
          return replyalya(err.response.data?.error || '❌ Rate limit')

        replyalya('❌ Terjadi kesalahan pada server API')
      }

//     		case 'uhd': {
        if (!quoted || !/image/.test(mime)) {
            await alya.sendMessage(m.chat, { react: { text: '🙄', key: m.key } })
            return replyalya(`Duh, mana fotonya? Kirim trus reply gambar abistu ketik *${command}*! Gitu aja nggak tahu, baka! 💢`);
        }

        let biaya = 5
        if (db.users[m.sender].limit < biaya) {
            return replyalya(`Limit kamu tinggal dikit, sok-sokan mau bikin foto UHD! 😒\n\n💡 Butuh ${biaya} limit, sana beli dulu!`);
        }

        await alya.sendMessage(m.chat, { react: { text: `⏳`, key: m.key } });

        try {
            const axios = require('axios');
            const fs = require('fs');
            const FormData = require('form-data');

            let mediaPath = await alya.downloadAndSaveMediaMessage(m.quoted, './temp/');

            let form = new FormData();
            form.append('reqtype', 'fileupload');
            form.append('fileToUpload', fs.createReadStream(mediaPath));

            let upload = await axios.post('https://catbox.moe/user/api.php', form, {
                headers: form.getHeaders()
            });

            let fileUrl = upload.data;
            if (!fileUrl.includes("https://")) {
                if (fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath);
                return replyalya("Duh, server upload-nya lagi ngambek! Bukan salah aku ya! ❌");
            }

            let apiUrl = `https://api.nexray.web.id/tools/upscale?url=${encodeURIComponent(fileUrl)}&resolusi=16`;

            let res = await axios.get(apiUrl, {
                responseType: "arraybuffer"
            });

            db.users[m.sender].limit -= biaya
            let sisa = db.users[m.sender].limit

            await alya.sendMessage(
                m.chat,
                {
                    image: res.data,
                    caption: `✅ *UHD Upscale Selesai!*\n\nNih, gambarnya udah 16x lebih jernih. Jangan dipelototin terus fotonya, nanti naksir! 🙄\n\n━━━━━━━━━━━━━━━\n💸 Pajak: ${biaya} Limit\n📊 Sisa: ${sisa}`
                },
                { quoted: m }
            );

            await alya.sendMessage(m.chat, { react: { text: `💖`, key: m.key } });
            if (fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath);

        } catch (err) {
            console.error(err);
            await alya.sendMessage(m.chat, { react: { text: `💢`, key: m.key } });
            replyalya('Hmph! Gagal kan... servernya lagi capek atau link-nya yang bermasalah. Coba lagi nanti deh! 😤');
        }
  }
}
