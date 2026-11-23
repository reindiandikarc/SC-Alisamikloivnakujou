// Plugin: whatmusic
// Auto-generated from Alya V12
// Commands: carimusik, whatmusic

const path = require('path')

module.exports = {
  command: ["carimusik", "whatmusic"],
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

        async function FindSong(buffer) {
            const form = new FormData();
            form.append('file', buffer, { filename: 'file.mp3', contentType: 'audio/mp3' });
            form.append('sample_size', buffer.length);
            try {
                let response = await fetch('https://api.doreso.com/humming', {
                    method: 'POST',
                    headers: {
                        ...form.getHeaders(),
                        "accept": "application/json, text/plain, */*",
                        "Referer": "https://aha-music.com/",
                        "Referrer-Policy": "strict-origin-when-cross-origin"
                    },
                    body: form
                });
                if (!response.ok) return reply(`Gagal mengenali lagu. Status: ${response.status}`);
                let data = await response.json();
                return data;
            } catch (error) {
                return { error: error.message };
            }
        }

        try {
            let q = m.quoted ? m.quoted : m;
            let mimetype = q.mimetype || (q.msg || {}).mimetype || '';
            if (!mimetype || !mimetype.includes('audio')) {
                return reply(`Balas pesan suara atau audio dengan perintah ${prefix + command} untuk mengenali lagunya.`);
            }
            let filePath = await alya.downloadAndSaveMediaMessage(q);
            let media = await fs.promises.readFile(filePath);

            let res = await FindSong(media);
            fs.unlinkSync(filePath);

            if (res.error) return reply(res.error);
            if (!res.data) return reply(`Lagu tidak ditemukan.`);

            let { artists, title } = res.data;
            let result = `─── PENGENALAN LAGU ───\n`;
            result += `Judul  : ${title}\n`;
            result += `Artis  : ${artists}\n`;
            result += `──────────────────────\n`;

            alya.sendMessage(m.chat, { text: result }, { quoted: m });
        } catch (e) {
            return reply(`Terjadi kesalahan: ${e.message || e}`);
        }
    }
    //=================================================================
  }
