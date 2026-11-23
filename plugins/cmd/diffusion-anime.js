// Plugin: diffusion-anime
// Auto-generated from Alya V12
// Commands: diffusion-anime

const path = require('path')

module.exports = {
  command: ["diffusion-anime"],
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

    	if (!text) return reply(`*• Contoh:* ${prefix + command} siapa nama anda`);
    await alya.sendMessage(m.chat, { react: { text: "⏱️",key: m.key,}})
            try {
    const sanai = {
      create: async (
        prompt = "Daffa",
        weight = 1024,
        height = 1024,
        guiscale = 5,
        paguiscale = 2,
        nis = 18,
        step = 20,
        sid = -1
      ) => {
        const url = 'https://api.freesana.ai/v1/images/generate';
        const headers = {
          'authority': 'api.freesana.ai',
          'origin': 'https://freesana.ai',
          'referer': 'https://freesana.ai/',
          'user-agent': 'Postify/1.0.0',
        };
        const data = {
          prompt: prompt,
          model: "sana_1_6b",
          width: weight,
          height: height,
          guidance_scale: guiscale,
          pag_guidance_scale: paguiscale,
          num_inference_steps: nis,
          steps: step,
          seed: sid,
        };
        try {
          const response = await axios.post(url, data, { headers });
          const { id, status, result, processingTime, width, height, nsfw, seed } = response.data;
          return {
            id,
            status,
            result,
            processingTime,
            width,
            height,
            nsfw,
            seed,
          };
        } catch (error) {
          console.error(error);
          throw error;
        }
      },
    }
        return m.reply(`Contoh penggunaan:\n${prefix + command} <deskripsi gambar>\n\nMisal:\n${prefix + command} "gunung di pagi hari"`);
      m.reply('Sedang membuat gambar..')
        const response = await sanai.create(text);
        if (response && response.result) {
          const imageUrl = response.result;
          await alya.sendFile(m.chat, imageUrl, 'generated-image.jpg', `✅ Gambar berhasil dibuat!\n\n• Prompt: *${text}*\n• Resolusi: ${response.width}x${response.height}\n• Waktu proses: ${response.processingTime} detik`, m);
        } else {
          m.reply('❌ Gagal membuat gambar. Silakan coba lagi.');
        }
      } catch (error) {
        console.error(error);
        m.reply('❌ Terjadi kesalahan saat membuat gambar. Silakan coba lagi nanti.');
      }
  }
}
