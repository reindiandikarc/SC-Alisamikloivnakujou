// Plugin: hercai-variants
// Created V20 — hercai image generation variants
// Semua menggunakan freesana.ai (Sana AI Image Generator)
// Commands: hercai-cartoon, hercai-animefy, hercai-lexica, hercai-prodia,
//           hercai-simurg, hercai-raava, hercai-shonin

'use strict';

const axios = require('axios');

// Style prompts per command
const STYLES = {
  'hercai-cartoon':  { emoji: '🎨', label: 'Cartoon Style',    suffix: ', cartoon style, colorful, cute, vibrant' },
  'hercai-animefy':  { emoji: '🎌', label: 'Anime Style',      suffix: ', anime style, manga art, high quality anime illustration' },
  'hercai-lexica':   { emoji: '📚', label: 'Lexica Style',      suffix: ', digital art, detailed, photorealistic, cinematic lighting' },
  'hercai-prodia':   { emoji: '🎨', label: 'Prodia Style',      suffix: ', artistic, creative, digital painting, masterpiece' },
  'hercai-simurg':   { emoji: '🎨', label: 'Simurg Style',      suffix: ', fantasy art, mythical, epic, detailed fantasy illustration' },
  'hercai-raava':    { emoji: '🎨', label: 'Raava Style',       suffix: ', ethereal, spiritual, glowing, mystical art style' },
  'hercai-shonin':   { emoji: '🎨', label: 'Shonin Style',      suffix: ', shounen manga style, dynamic, action-oriented, bold lines' },
};

async function generateImage(prompt) {
  const response = await axios.post(
    'https://api.freesana.ai/v1/images/generate',
    {
      prompt,
      model: 'sana_1_6b',
      width: 1024, height: 1024,
      guidance_scale: 5, pag_guidance_scale: 2,
      num_inference_steps: 18, steps: 20, seed: -1,
    },
    {
      headers: {
        'authority': 'api.freesana.ai',
        'origin': 'https://freesana.ai',
        'referer': 'https://freesana.ai/',
        'user-agent': 'Mozilla/5.0',
      },
      timeout: 60000
    }
  );
  return response.data;
}

module.exports = {
  command: Object.keys(STYLES),
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx;

    const style = STYLES[command] || STYLES['hercai-cartoon'];

    if (!text) return replyalya(
      `${style.emoji} *Herc AI — ${style.label}*\n\n` +
      `• *Contoh:* ${prefix}${command} a girl in a garden\n\n` +
      `_Powered by Sana AI Image Generator_`
    );

    await alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

    const styledPrompt = text + style.suffix;

    try {
      const result = await generateImage(styledPrompt);

      if (result && result.result) {
        await alya.sendMessage(m.chat, {
          image: { url: result.result },
          caption:
            `${style.emoji} *Herc AI — ${style.label}*\n\n` +
            `• *Prompt:* ${text}\n` +
            `• *Style:* ${style.label}\n` +
            `• *Resolusi:* ${result.width || 1024}x${result.height || 1024}`
        }, { quoted: m });

        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } else {
        throw new Error('Gambar tidak ditemukan di respons');
      }

    } catch (error) {
      console.error(`[${command}]`, error.message);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      replyalya(`❌ Gagal generate gambar ${style.label}. Coba lagi nanti.`);
    }
  }
};
