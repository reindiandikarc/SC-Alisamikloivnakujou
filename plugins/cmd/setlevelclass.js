// Plugin: setlevelclass
// Commands: setlevelclass
// Alya V20 — [OWNER ONLY] Paksa set level class/player (duelLvl) milik user tertentu
// Format:
//   .setlevelclass <jumlah>            -> set level class OWNER sendiri
//   .setlevelclass <jumlah> @mention    -> set level class milik target
'use strict';

let PlayerLevel = {};
try { PlayerLevel = require('../../lib/playerlevel'); } catch (e) {
  console.error('[setlevelclass] gagal load lib/playerlevel.js:', e.message);
}

// Formula bonus dipusatkan di lib/playerlevel.js (JANGAN duplikat formula di sini lagi)
const getBonus = (u) => {
  const lvl = parseInt(u.duelLvl) || 0;
  return PlayerLevel.getClassBonus ? PlayerLevel.getClassBonus(lvl) : { hp: lvl * 2, dmg: Math.round(lvl * 0.4) };
};

module.exports = {
  command: ['setlevelclass'],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const {
      args, prefix,
      replyalya, replytolak,
      sender, resolveTarget, Ryuu
    } = ctx;

    if (!Ryuu) return replytolak(global.mess?.only?.owner || '❌ Khusus Owner!');

    const jumlah = parseInt(args[0]);
    if (!args[0] || isNaN(jumlah) || jumlah < 0) {
      return replyalya(
        `⚠️ *Format salah!*\n\n` +
        `➤ *${prefix}setlevelclass <jumlah>* — set level class kamu sendiri\n` +
        `➤ *${prefix}setlevelclass <jumlah> @mention* — set level class milik target\n\n` +
        `Contoh: *${prefix}setlevelclass 30 @62812xxxx*`
      );
    }

    const target = (resolveTarget ? resolveTarget(ctx) : null) || sender;

    if (!global.db.users) global.db.users = {};
    if (!global.db.users[target]) global.db.users[target] = {};
    const targetDb = global.db.users[target];

    if (!targetDb.class) {
      return replyalya(
        `❌ *${target === sender ? 'Kamu' : 'Target'} belum punya Class!*\n\n` +
        `Suruh pilih dulu: *${prefix}selectclass*`
      );
    }

    const oldLvl = targetDb.duelLvl || 0;
    const cap = PlayerLevel.MAX_LEVEL || 999;
    targetDb.duelLvl = Math.min(cap, jumlah);

    const bonus = getBonus(targetDb);

    await alya.sendMessage(m.chat, { react: { text: '👑', key: m.key } });
    return alya.sendMessage(m.chat, {
      text:
        `╭─「 👑 *OWNER: SET LEVEL CLASS* 」\n│\n` +
        `│ 👤 Target: @${target.split('@')[0]}\n│\n` +
        `│ 🔧 Level Class: ${oldLvl} ➜ *${jumlah}*\n` +
        `│ ❤️ Bonus HP: +${bonus.hp}\n` +
        `│ 🗡️ Bonus DMG: +${bonus.dmg}\n` +
        `╰──────────────────`,
      mentions: [target]
    }, { quoted: m });
  }
};
