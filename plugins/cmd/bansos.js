// Plugin: bansos
// Auto-generated from Alya V12
// Commands: bansos

const path = require('path')

module.exports = {
  command: ["bansos"],
  tags: ['admin'],
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
        let h = Math.floor(ms / 3600000);
        let m = Math.floor(ms / 60000) % 60;
        let s = Math.floor(ms / 1000) % 60;
        return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
      }

      let userAlt = global.db.users[m.sender];
      let randomaku = Math.floor(Math.random() * 101);
      let randomkamu = Math.floor(Math.random() * 101);

      let now = new Date() * 1;
      let cooldownNormal = 300000;
      let durasiPenjara = 14400000;

      let sisaWaktu = user.lastbansos + cooldownNormal - now;
      let sisaPenjara = user.lastbansos - now;

      if (now < user.lastbansos) {
        return replyalya(`*ANDA MASIH DI TAHAN!* 👮‍♂️\n\nSilahkan tunggu selama *${clockString(user.lastbansos - now)}* lagi untuk bebas dan bisa melakukan korupsi lagi.`);
      }
      if (now - user.lastbansos < cooldownNormal) {
        return replyalya(`Silahkan menunggu *${clockString(sisaWaktu)}* lagi untuk mencoba korupsi bansos.`);
      }

      if (user.money < 1000) {
        return replyalya(`Uang Anda harus di atas 1000 untuk menggunakan command ini.`);
      }

      if (randomaku > randomkamu) {

        user.money -= 3500000;
        user.lastbansos = now + durasiPenjara;

        return alya.sendMessage(m.chat, {
          image: { url: 'https://telegra.ph/file/afcf9a7f4e713591080b5.jpg' },
          caption: `*EKSEKUSI GAGAL!* 🕴️❌\n\nKamu tertangkap saat korupsi dana bansos! Kamu didenda *Rp 3.000.000* dan dijebloskan ke penjara selama *4 Jam*.`
        });

      } else if (randomaku < randomkamu) {
        user.money += 3000000;
        user.lastbansos = now;

        return alya.sendMessage(m.chat, {
          image: { url: 'https://telegra.ph/file/d31fcc46b09ce7bf236a7.jpg' },
          caption: `*EKSEKUSI BERHASIL!* 🕴️💰\n\nKamu berhasil korupsi dana bansos dan mendapatkan *Rp 3.000.000*. Cepat cuci uangnya sebelum terlacak!`
        });

      } else {
        user.lastbansos = now;
        return replyalya(`*HAMPIR TERCIDUK!* 🏃‍♂️\n\nKamu gagal korupsi tapi berhasil melarikan diri dari kejaran polisi. Tidak ada hasil, tapi kamu selamat!`);
      }
    }
  }
