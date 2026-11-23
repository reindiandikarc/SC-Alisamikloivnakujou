// Plugin: setlevelweapon
// Commands: setlevelweapon
// Alya V20 — [OWNER ONLY] Paksa set level weapon user tertentu (atau weapon yg sedang di-equip)
// Format:
//   .setlevelweapon <jumlah>                      -> set level weapon yg di-equip OWNER sendiri
//   .setlevelweapon <jumlah> @mention              -> set level weapon yg di-equip target
//   .setlevelweapon <jumlah> @mention <id_weapon>  -> set level weapon spesifik milik target
'use strict';

let W = {};
try { W = require('../../lib/weapons'); } catch (e) {
  console.error('[setlevelweapon] gagal load lib/weapons.js:', e.message);
}

module.exports = {
  command: ['setlevelweapon'],
  tags: ['owner'],
  run: async (alya, m, ctx) => {
    const {
      args, prefix,
      replyalya, replytolak,
      sender, resolveTarget, Ryuu
    } = ctx;

    if (!Ryuu) return replytolak(global.mess?.only?.owner || '❌ Khusus Owner!');
    if (!W.getWeaponById) return replyalya('❌ Sistem weapon belum siap, hubungi owner!');

    const jumlah = parseInt(args[0]);
    if (!args[0] || isNaN(jumlah) || jumlah < 1) {
      return replyalya(
        `⚠️ *Format salah!*\n\n` +
        `➤ *${prefix}setlevelweapon <jumlah>* — set level weapon yg kamu equip\n` +
        `➤ *${prefix}setlevelweapon <jumlah> @mention* — set level weapon yg target equip\n` +
        `➤ *${prefix}setlevelweapon <jumlah> @mention <id_weapon>* — set level weapon spesifik\n\n` +
        `Contoh: *${prefix}setlevelweapon 25 @62812xxxx kusanagi_no_tsurugi*`
      );
    }

    const target = (resolveTarget ? resolveTarget(ctx) : null) || sender;

    if (!global.db.users) global.db.users = {};
    if (!global.db.users[target]) global.db.users[target] = {};
    const targetDb = global.db.users[target];

    // id weapon: argumen terakhir kalau bukan angka & bukan mention, atau fallback ke equippedWeapon
    let weaponId = args.find((a, i) => i > 0 && !a.startsWith('@') && isNaN(parseInt(a)))?.toLowerCase();
    if (!weaponId) weaponId = targetDb.equippedWeapon;

    if (!weaponId) {
      return replyalya(
        `❌ *${target === sender ? 'Kamu' : 'Target'} belum equip weapon apapun* dan tidak menyebutkan id_weapon secara manual.\n\n` +
        `Cek daftar weapon: *${prefix}inventoryweapon*`
      );
    }

    const base = W.getWeaponById(weaponId);
    if (!base) return replyalya(`❌ Weapon *${weaponId}* tidak dikenali.`);

    if (!targetDb.weapons) targetDb.weapons = {};
    if (!targetDb.weapons[weaponId]) targetDb.weapons[weaponId] = { level: 1, xp: 0 };

    const oldLvl = targetDb.weapons[weaponId].level || 1;
    targetDb.weapons[weaponId].level = jumlah;
    targetDb.weapons[weaponId].xp = 0;

    const eff = W.getEffectiveWeaponStats(weaponId, jumlah);
    const rarityColor = W.RARITY[base.rarity]?.color || '⚪';

    await alya.sendMessage(m.chat, { react: { text: '👑', key: m.key } });
    return alya.sendMessage(m.chat, {
      text:
        `╭─「 👑 *OWNER: SET LEVEL WEAPON* 」\n│\n` +
        `│ 👤 Target: @${target.split('@')[0]}\n` +
        `│ ${rarityColor} Weapon: *${base.name}* (${base.rarity})\n│\n` +
        `│ 🔧 Level: ${oldLvl} ➜ *${jumlah}*\n` +
        `│ ⚔️ DMG efektif sekarang: +${eff.effectiveDmg}\n` +
        `╰──────────────────`,
      mentions: [target]
    }, { quoted: m });
  }
};
