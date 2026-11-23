// Plugin: text2anime
// Auto-generated from Alya V12
// Commands: quotesanime, text2anime

const path = require('path')

module.exports = {
  command: ["quotesanime", "text2anime"],
  tags: ['anime'],
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

    async function generateAnimeImage(prompt) {
      try {
        return await new Promise(async (resolve, reject) => {
          if (!prompt) return reject("Prompt tidak boleh kosong!");

          axios.post("https://aiimagegenerator.io/api/model/predict-peach", {
            prompt,
            key: "Anime",
            width: 512,
            height: 768,
            quantity: 1,
            size: "512x768",
            nsfw: true
          }).then(res => {
            const data = res.data;
            if (data.code !== 0) return reject(data.message);
            if (!data.data?.url) return reject("Gagal mendapatkan URL gambar!");

            return resolve({
              status: true,
              image: data.data.url
            });
          }).catch(reject);
        });
      } catch (e) {
        return { status: false, message: e.message };
      }
    }
      const prompt = args.join(' ');
      if (!prompt) {
        return alya.sendMessage(m.chat, { text: `Masukkan prompt!\n*EX:* .txt2anime loli` }, { quoted: m });
      }
      try {
        const res = await generateAnimeImage(prompt);
        if (!res.status) throw new Error(res.message);
        await alya.sendMessage(m.chat, {
          image: { url: res.image },
          caption: `✨ *Prompt:* ${prompt}`
        }, { quoted: m });
      } catch (error) {
        alya.sendMessage(m.chat, { text: `Error: ${error.message || 'Gagal membuat gambar.'}` }, { quoted: m });
      }
  }
}
