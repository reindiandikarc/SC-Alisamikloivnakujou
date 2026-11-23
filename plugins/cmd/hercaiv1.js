// Plugin: hercaiv1
// Fixed V20 — Full rewrite (return before image send, mismatched brackets, stale cases)
// Commands: hercaiv1

'use strict';

const axios = require('axios');

module.exports = {
  command: ['hercaiv1'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx;

    if (!text) return replyalya(
      `🎨 *Herc AI v1 — Image Generator*\n\n` +
      `• *Contoh:* ${prefix}${command} a beautiful girl singing at sunset\n\n` +
      `_Powered by Sana AI Image Generator_`
    );

    await alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

    try {
      const url = 'https://api.freesana.ai/v1/images/generate';
      const headers = {
        'authority': 'api.freesana.ai',
        'origin': 'https://freesana.ai',
        'referer': 'https://freesana.ai/',
        'user-agent': 'Mozilla/5.0',
      };
      const data = {
        prompt: text,
        model: 'sana_1_6b',
        width: 1024,
        height: 1024,
        guidance_scale: 5,
        pag_guidance_scale: 2,
        num_inference_steps: 18,
        steps: 20,
        seed: -1,
      };

      const response = await axios.post(url, data, { headers, timeout: 60000 });
      const result = response.data;

      if (result && result.result) {
        await alya.sendMessage(m.chat, {
          image: { url: result.result },
          caption:
            `✅ *Herc AI v1 — Image Generated!*\n\n` +
            `• *Prompt:* ${text}\n` +
            `• *Resolusi:* ${result.width || 1024}x${result.height || 1024}\n` +
            `• *Waktu:* ${result.processingTime || '-'} detik`
        }, { quoted: m });

        await alya.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      } else {
        throw new Error('Gambar tidak ditemukan di respons');
      }

    } catch (error) {
      console.error('[hercaiv1]', error.message);
      await alya.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      replyalya('❌ Gagal membuat gambar. Coba lagi nanti.');
    }
  }
};
