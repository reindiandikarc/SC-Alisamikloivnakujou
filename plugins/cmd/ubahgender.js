// Plugin: ubahgender
// Commands: ubahgender, ubahjenis, gender, jenis
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['ubahgender', 'ubahjenis', 'gender', 'jenis'],
  tags: ['fun'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

    if (!m.quoted) return reply(`Kirim/reply gambar dengan caption *${prefix + command}*`);

    const fs = require('fs');
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const quotedMime = m.quoted.mimetype || "";
    const defaultPrompt = "ubah gender orang yang ada di gambar";
    if (!/image\/(jpe?g|png)/.test(quotedMime)) return reply(`Format ${quotedMime} tidak didukung! Hanya jpeg/jpg/png`);

    const promptText = text || defaultPrompt;

    reply(mess.wait);

    try {
      const imgData = await m.quoted.download();
      // ✅ FIX: key lama tidak dikenal/asing (tidak ada di global.aiso).
      // Sekarang pakai rotasi dari key resmi yang sudah dikonfigurasi di
      // settings.js, konsisten dengan plugin AI lain.
      const keyPool = Array.isArray(global.aiso) && global.aiso.length ? global.aiso : []
      if (!keyPool.length) return replyalya('❌ Belum ada API key Gemini yang dikonfigurasi (global.aiso kosong).')
      const apiKey = keyPool[Math.floor(Math.random() * keyPool.length)]

      const genAI = new GoogleGenerativeAI(apiKey);
      const base64Image = imgData.toString("base64");

      const contents = [
        { text: promptText },
        {
          inlineData: {
            mimeType: quotedMime,
            data: base64Image
          }
        }
      ];

      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp-image-generation",
        generationConfig: {
          responseModalities: ["Text", "Image"]
        },
      });

      const response = await model.generateContent(contents);

      let resultImage;
      for (const part of response.response.candidates[0].content.parts) {
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          resultImage = Buffer.from(imageData, "base64");
        }
      }

      if (resultImage) {
        const tempPath = `./temp/gemini_${Date.now()}.png`;
        fs.writeFileSync(tempPath, resultImage);
        await alya.sendMessage(m.chat, {
          image: { url: tempPath },
          caption: `✅ *Penampilan berhasil diubah sesuai gender*`
        }, { quoted: m });

        setTimeout(() => {
          try { fs.unlinkSync(tempPath); } catch {}
        }, 30000);
      } else {
        reply("Gagal menghasilkan gambar. Coba lagi nanti.");
      }
    } catch (error) {
      console.error('[ubahgender] error:', error?.message || error);
      reply(`Error: ${error.message}`);
    }
  }
};
