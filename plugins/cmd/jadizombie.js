// Plugin: jadizombie
// Auto-generated from Alya V12
// Commands: tozombie, jadizombie

const path = require('path')

module.exports = {
  command: ["tozombie", "jadizombie"],
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

      if (!m.quoted) return m.reply(`Kirim/reply gambar dengan caption *${prefix + command}*`);
      const { GoogleGenerativeAI } = require ("@google/generative-ai");
      let mimeAlt = m.quoted.mimetype || "";
      let defaultPrompt = "Create a 1/7 scale commercialized figure of the character in the illustration, in a realistic style and environment. Place the figure on a computer desk, using a circular transparent acrylic base without any text. On the computer screen, display the ZBrush modeling process of the figure. Next to the computer screen, place a BANDAI-style toy packaging box printed with the original artwork.";
      if (!/image\/(jpe?g|png)/.test(mime)) return m.reply(`Format ${mime} tidak didukung! Hanya jpeg/jpg/png`);
      let promptText = text || defaultPrompt;
      m.reply(mess.wait);
      try {
        let imgData = await m.quoted.download();
        const keyPool = Array.isArray(global.aiso) && global.aiso.length ? global.aiso : []
        if (!keyPool.length) return replyalya('❌ Belum ada API key Gemini yang dikonfigurasi (global.aiso kosong).')
        let genAI = new GoogleGenerativeAI(keyPool[Math.floor(Math.random() * keyPool.length)]);
        const base64Image = imgData.toString("base64");
        const contents = [
          { text: promptText },
          {
            inlineData: {
              mimeType: mime,
              data: base64Image
            }
          }
        ];
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash-image",
          generationConfig: {
            responseModalities: ["Text", "Image"]
          },
        });
        const response = await model.generateContent(contents);
        let resultImage;
        let resultText = "";
        for (const part of response.response.candidates[0].content.parts) {
          if (part.text) {
            resultText += part.text;
          } else if (part.inlineData) {
            const imageData = part.inlineData.data;
            resultImage = Buffer.from(imageData, "base64");
          }
        }
        if (resultImage) {
          const tempPath = `./temp/gemini_${Date.now()}.png`;
          fs.writeFileSync(tempPath, resultImage);
          await alya.sendMessage(m.chat, {
            image: { url: tempPath },
            caption: `*berhasil menghitamkan*`
          }, { quoted: m });
          setTimeout(() => {
            try {
              fs.unlinkSync(tempPath);
            } catch {}
          }, 30000);
        } else {
          m.reply("Gagal...");
        }
      } catch (error) {
        console.error(error);
        m.reply(`Error: ${error.message}`);
      }
    }
    //============ CASE BUG BY RYUU =====================
  }
