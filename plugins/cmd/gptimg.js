// Plugin: gptimg
// Commands: gptimg, bingimg
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['gptimg', 'bingimg'],
  tags: ['ai'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

if (!isPrem) return replyprem(mess.premium)
if (!text) return reply('Mana Promt Nya Bos...')
await alya.sendMessage(m.chat, { react: { text: "⏱️",key: m.key,}}) 
    let data = await BingAlya(text)
  }
};
