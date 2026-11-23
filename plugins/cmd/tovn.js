// Plugin: tovn
// Commands: tovn, toptt
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['tovn', 'toptt'],
  tags: ['converter'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

    if (!/video/.test(mime || '') && !/audio/.test(mime || '')) return replyalya(`Reply Video/Audio That You Want To Be VN With Caption ${prefix + command}`)
    if (!quoted) return replyalya(`Reply Video/Audio That You Want To Be VN With Caption ${prefix + command}`)
    reply(mess.wait)
    try {
      const media = await quoted.download()
      const { toPTT } = require('../../lib/converter')
      const audio = await toPTT(media, 'mp4')
      await alya.sendMessage(m.chat, { audio: audio, mimetype: 'audio/mpeg', ptt: true }, { quoted: m })
    } catch (e) {
      console.error('[tovn] error:', e?.message || e)
      replyalya(`❌ Gagal mengonversi ke voice note.\n_${e?.message || ''}_`)
    }
  }
};
