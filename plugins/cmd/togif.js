// Plugin: togif
// Commands: togif
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['togif'],
  tags: ['converter'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

if (!quoted) return replyalya('Reply video')
if (!/webp/.test(mime)) return replyalya(`reply sticker with caption *${prefix + command}*`)
reply(mess.wait)
		let { webp2mp4File } = require('./lib/uploader')
let media = await alya.downloadAndSaveMediaMessage(quoted)
let webpToMp4 = await webp2mp4File(media)
await alya.sendMessage(m.chat, { video: { url: webpToMp4.result, caption: 'Convert Webp To Video' }, gifPlayback: true }, { quoted: m })
await fs.unlinkSync(media)
  }
};
