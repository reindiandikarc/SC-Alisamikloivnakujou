// Plugin: addcase
// Auto-generated from Alya V12
// Commands: addcase

const path = require('path')

module.exports = {
  command: ["addcase"],
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

        if (!Ryuu) return replytolak(mess.only.owner)
        if (!text) return replyalya('Mana case nya');
        const fs = require('fs');
    const namaFile = 'alya.js';

    const caseBaru = `${text}`;

    fs.readFile(namaFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Terjadi kesalahan saat membaca file:', err);
            return;
        }

        // Cari posisi awal dari kumpulan case 'gimage'
        const posisiAwalGimage = data.indexOf("case 'addcase':");

        if (posisiAwalGimage !== -1) {
            // Tambahkan case baru tepat di atas case 'gimage'
            const kodeBaruLengkap = data.slice(0, posisiAwalGimage) + '\n' + caseBaru + '\n' + data.slice(posisiAwalGimage);

            // Tulis kembali file dengan case baru
            fs.writeFile(namaFile, kodeBaruLengkap, 'utf8', (err) => {
                if (err) {
                    replyalya('Terjadi kesalahan saat menulis file:', err);
                } else {
                    replyalya('Case baru berhasil ditambahkan di atas case gimage.');
                }
            });
        } else {
            replyalya('Tidak dapat menemukan case gimage dalam file.');
        }
    });

    }
    //==================================================================
  }
