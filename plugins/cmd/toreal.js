// Plugin: toreal
// Auto-generated from Alya V12
// Commands: toreal

const path = require('path')

module.exports = {
  command: ["toreal"],
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

        if (!quoted) return reply('Reply gambar dengan caption .toreal');
        if (!/image/.test(mime)) return reply('Reply gambar dengan gambar!');

        m.reply('Sedang memproses gambar menjadi realistik...');

        try {
            // Download gambar
            let buffer = await alya.downloadMediaMessage(quoted);

            // Upload ke qu.ax (supaya dapat link public untuk API)
            const FormData = require("form-data");
            let form = new FormData();
            form.append("files[]", buffer, { filename: "image.jpg" });

            let up = await axios.post("https://qu.ax/upload.php", form, {
                headers: form.getHeaders()
            });

            if (!up.data.success) return reply("Gagal upload ke qu.ax");

            let imgUrl = up.data.files[0].url;

            // Kirim ke Stability AI img2img endpoint
            const apiKey = 'sk-OkBvToiPZQmJNlbrphYF55KQlS1ayrR3ZZJIUOl6rx2sbtjr';

            let payload = {
                init_image: imgUrl,
                prompt: "ultra realistic human face, photorealistic, highly detailed, natural skin texture, DSLR quality",
                cfg_scale: 7,
                strength: 0.4,
                samples: 1
            };

            let { data } = await axios.post('https://api.stability.ai/v2beta/stable-image-to-image', payload, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!data.artifacts || data.artifacts.length === 0) return reply('Gagal mengubah gambar.');

            let outputUrl = data.artifacts[0].url;

            alya.sendMessage(m.chat, { image: { url: outputUrl }, caption: "Berikut hasil toreal realistiknya!" }, { quoted: m });

        } catch (err) {
            console.log(err.response?.data || err);
            reply('Terjadi kesalahan saat proses Stability AI.');
        }
  }
}
