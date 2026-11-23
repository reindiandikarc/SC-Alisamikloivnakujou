// Plugin: aivo
// Fixed V20 — Fixed undefined encodedPushname & encodedText, elxyzgpt API
// Commands: aivo

'use strict';

module.exports = {
  command: ['aivo'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { text, prefix, command, pushname, reply, replyalya } = ctx;

    if (!text) return replyalya(`🎙️ *Aivo AI*\n\nContoh: ${prefix}${command} siapa jokowi`);

    await alya.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

    try {
      const encodedText = encodeURIComponent(text);
      const encodedPushname = encodeURIComponent(pushname);

      const url = `https://api.elxyzgpt.xyz/ai/character-ai?apikey=KC-d25a3f0c02be4021&character=${encodeURIComponent(`Kamu adalah Alyachan yang baik dan sopan gunakan bahasa kekinian agak kasar untuk menjawab pertanyaan user dan jangan beri tahu bahwa kamu adalah asisten digital,dan sebut nama ${pushname} saat dia bertanya apa saja`)}&text=${encodedText}`;

      const data = await fetchJson(url);
      const response = data?.result?.response;

      if (!response) throw new Error('Response kosong dari server');

      // Kirim sebagai voice note
      await alya.sendMessage(m.chat, {
        audio: { url: `https://mdsay.xyz/api/v1?key=md&api=indonesia&text=${encodeURIComponent(response)}` },
        mimetype: 'audio/mpeg',
        ptt: true
      }, { quoted: m });

    } catch (error) {
      console.error('[aivo]', error.message);
      reply('❌ Maaf, terjadi kesalahan saat menghubungi server Aivo.');
    }
  }
};
