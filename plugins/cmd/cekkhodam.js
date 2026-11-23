// Plugin: cekkhodam
// Auto-generated from Alya V12
// Commands: cekkhodam

const path = require('path')

module.exports = {
  command: ["cekkhodam"],
  tags: ['info'],
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

      if (!text) return replyalya('Nama nya mana yang mau di cek khodam nya');

      function pickRandom(list) {
        return list[Math.floor(Math.random() * list.length)];
      }

      const ceknyaa = pickRandom(['Macan Tutul','Gajah Sumatera','Orangutan','Harimau Putih','Badak Jawa','Pocong','Kuntilanak','Genderuwo','Wewe Gombel','Kuyang','Lembuswana','Anoa','Komodo','Elang Jawa','Burung Cendrawasih','Tuyul','Babi Ngepet','Sundel Bolong','Jenglot','Lele Sangkuriang','Kucing Hutan','Ayam Cemani','Cicak','Burung Merak','Kuda Lumping','Buaya Muara','Banteng Jawa','Monyet Ekor Panjang','Tarsius','Cenderawasih Biru','Setan Merah','Kolor Ijo','Palasik','Nyi Roro Kidul','Siluman Ular','Kelabang','Beruang Madu','Serigala','Hiu Karang','Rajawali','Lutung Kasarung','Kuda Sumba','Ikan Arwana','Jalak Bali','Kambing Etawa','Kelelawar','Burung Hantu','Ikan Cupang']);
      const damping = pickRandom(['1 tahun lalu','2 tahun lalu','3 tahun lalu','4 tahun lalu','lahir']);

      const khodam = `khodam ${text}, adalah ${ceknyaa}, mendampingi dari ${damping}`;

      const encoded = encodeURIComponent(khodam);

      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=id&client=tw-ob`;

      await alya.sendMessage(m.chat, {
        audio: { url: ttsUrl },
        mimetype: 'audio/mpeg',
        ptt: true
      }, { quoted: m });

    }
    //=========================================\\======
  }
