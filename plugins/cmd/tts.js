// Plugin: tts
// Commands: say, tts, gtts
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['say', 'tts', 'gtts'],
  tags: ['tools'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

    if (!text) return replyalya('Where is the text?')

    try {
      const { modul } = require('../../module')
      const { googleTTS } = modul

      const xeonrl = googleTTS.getAudioUrl(text, {
        lang: "id",
        slow: false,
        host: "https://translate.google.com",
      })

      await alya.sendMessage(m.chat, {
        audio: { url: xeonrl },
        mimetype: 'audio/mp4',
        ptt: true,
        fileName: `tts.mp3`,
      }, { quoted: m })
    } catch (e) {
      console.error('[tts] error:', e?.message || e)
      replyalya(`❌ Gagal membuat TTS.\n_${e?.message || ''}_`)
    }
  }
};
