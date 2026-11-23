// Plugin: react
// Commands: react
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['react'],
  tags: ['group'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

if (!Ryuu) return replytolak(mess.only.owner)
reactionMessage = {
react: {
    text: args[0],
    key: { remoteJid: m.chat, fromMe: true, id: quoted.id }
}
}
alya.sendMessage(m.chat, reactionMessage)
  }
};
