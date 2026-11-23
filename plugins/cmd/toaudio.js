// Plugin: toaudio
// Commands: toaudio
// Ported from Alya V10 → V13
//
// ⚠️ NOTE: command array dipersempit ke 'toaudio' saja. Versi lama meng-klaim
// 'toaud' dan 'tomp3' juga, tapi keduanya sudah punya file plugin khusus
// sendiri di cmd_registry.json (toaud.js, tomp3.js) — klaim ganda di sini
// tidak pernah benar-benar dipakai untuk routing (registry yang menentukan),
// tapi membingungkan untuk dibaca, jadi dirapikan.
'use strict';

module.exports = {
  command: ['toaudio'],
  tags: ['converter'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

    if (!/video/.test(mime || '') && !/audio/.test(mime || '')) return replyalya(`Send/Reply Video/Audio You Want to Use as Audio With Caption ${prefix + command}`)
    if (!quoted) return replyalya(`Send/Reply Video/Audio You Want to Use as Audio With Caption ${prefix + command}`)
    reply(mess.wait)
    try {
      const media = await quoted.download()
      const { toAudio } = require('../../lib/converter')
      const audio = await toAudio(media, 'mp4')
      await alya.sendMessage(m.chat, { audio: audio, mimetype: 'audio/mpeg' }, { quoted: m })
    } catch (e) {
      console.error('[toaudio] error:', e?.message || e)
      replyalya(`❌ Gagal mengonversi ke audio.\n_${e?.message || ''}_`)
    }
  }
};
