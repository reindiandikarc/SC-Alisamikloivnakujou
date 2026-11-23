// Plugin: help
// Commands: help
// Ported from Alya V10 → V13
'use strict';

module.exports = {
  command: ['help'],
  tags: ['general'],
  run: async (alya, m, ctx) => {
    const { command, text, q, prefix, reply, replyalya, replytolak, replyprem,
      sender, from, pushname, isGroup, isAdmins, isBotAdmins, Ryuu, isPrem,
      isOwn, quoted, mime, args, db, mess } = ctx;

reply(`🎲🐍 *Permainan Ular Tangga* 🐍🎲\n\n*Commands:*\n- ${prefix + command} join : Bergabung ke dalam permainan.\n- ${prefix + command} start : Memulai permainan.\n- ${prefix + command} roll : Melempar dadu untuk bergerak.\n- ${prefix + command} reset : Mereset sesi permainan.`)
  }
};
