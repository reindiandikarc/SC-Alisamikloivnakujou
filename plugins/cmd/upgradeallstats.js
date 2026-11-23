// Plugin: upgradeallstats
// Commands: upgradeallstats
// Alya V20 — Versi "praktis" dari .upgradestats: naik level SEBANYAK MUNGKIN sekaligus
// sesuai jumlah EXP (player) atau uang (weapon) yang dipunya saat ini, tanpa perlu spam command.
// .upgradeallstats weapon  -> pakai lib/weapons.js, cost = uang (sama seperti upgradestats weapon)
// .upgradeallstats player  -> pakai user.exp, formula sama seperti upgradestats player: (lvl+1)*20000
'use strict';

let W = {};
try { W = require('../../lib/weapons'); } catch (e) {
  console.error('[upgradeallstats] gagal load lib/weapons.js:', e.message);
}

let PlayerLevel = {};
try { PlayerLevel = require('../../lib/playerlevel'); } catch (e) {
  console.error('[upgradeallstats] gagal load lib/playerlevel.js:', e.message);
}

const WEAPON_XP_PER_TRY = 35;
const WEAPON_COST_PER_TRY = 75000;

// Formula bonus & XP dipusatkan di lib/playerlevel.js (JANGAN duplikat formula di sini lagi)
const getBonus = (u) => {
  const lvl = parseInt(u.duelLvl) || 0;
  return PlayerLevel.getClassBonus ? PlayerLevel.getClassBonus(lvl) : { hp: lvl * 2, dmg: Math.round(lvl * 0.4) };
};

module.exports = {
  command: ['upgradeallstats'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const {
      args, prefix,
      replyalya,
      sender, pushname, user
    } = ctx;

    const target = (args[0] || '').toLowerCase();
    if (!['weapon', 'player'].includes(target)) {
      return replyalya(
        `⚠️ *Format salah!*\n\n` +
        `Ketik salah satu:\n` +
        `➤ *${prefix}upgradeallstats weapon* — habiskan saldo buat naikin level weapon sebanyak mungkin\n` +
        `➤ *${prefix}upgradeallstats player* — habiskan EXP buat naikin level class sebanyak mungkin`
      );
    }

    if (!global.db.users) global.db.users = {};
    if (!global.db.users[sender]) global.db.users[sender] = {};
    const userDb = global.db.users[sender];

    // ═══════════════════════════════════════════════════════════
    // .upgradeallstats weapon
    // ═══════════════════════════════════════════════════════════
    if (target === 'weapon') {
      if (!W.getWeaponById) return replyalya('❌ Sistem weapon belum siap, hubungi owner!');

      const weaponId = userDb.equippedWeapon;
      if (!weaponId || !userDb.weapons?.[weaponId]) {
        return replyalya(
          `❌ *Kamu belum equip weapon apapun!*\n\n` +
          `Equip dulu: *${prefix}equipweapon <id_weapon>*`
        );
      }

      const base = W.getWeaponById(weaponId);
      if (!base) return replyalya(`❌ Data weapon *${weaponId}* tidak dikenali.`);

      const wData = userDb.weapons[weaponId];
      const startLvl = wData.level || 1;

      if ((userDb.money || 0) < WEAPON_COST_PER_TRY) {
        return replyalya(
          `💸 Saldo kamu (Rp ${(userDb.money || 0).toLocaleString('id-ID')}) belum cukup ` +
          `buat 1x percobaan pun (Rp ${WEAPON_COST_PER_TRY.toLocaleString('id-ID')}).`
        );
      }

      let tries = 0;
      let levelUps = 0;
      const MAX_TRIES = 100000; // safety guard biar ga infinite loop kalau ada bug data
      while (userDb.money >= WEAPON_COST_PER_TRY && tries < MAX_TRIES) {
        userDb.money -= WEAPON_COST_PER_TRY;
        wData.xp = (wData.xp || 0) + WEAPON_XP_PER_TRY;
        tries++;

        const curLvl = wData.level || 1;
        const needed = W.xpNeeded(curLvl);
        if (wData.xp >= needed) {
          wData.xp -= needed;
          wData.level = curLvl + 1;
          levelUps++;
        }
      }

      const finalLvl = wData.level || 1;
      const finalNeeded = W.xpNeeded(finalLvl);
      const effNew = W.getEffectiveWeaponStats(weaponId, finalLvl);
      const rarityColor = W.RARITY[base.rarity]?.color || '⚪';
      const barLen = 10;
      const pct = Math.min(barLen, Math.round((wData.xp / finalNeeded) * barLen));
      const bar = '▰'.repeat(pct) + '▱'.repeat(barLen - pct);

      await alya.sendMessage(m.chat, { react: { text: levelUps > 0 ? '🆙' : '✨', key: m.key } });
      return replyalya(
        `╭─「 🚀 *UPGRADE ALL STATS: WEAPON* 」\n│\n` +
        `│ ${rarityColor} *${base.name}* (${base.rarity})\n│\n` +
        `│ 🔁 Total percobaan: ${tries}x\n` +
        `│ 🆙 Level naik: ${startLvl} ➜ ${finalLvl} (+${levelUps})\n` +
        `│ ⚔️ DMG sekarang: +${effNew.effectiveDmg}\n` +
        `│ 📈 *XP:* ${wData.xp}/${finalNeeded}\n` +
        `│ ${bar}\n` +
        `│ 💰 *Sisa Saldo:* Rp ${userDb.money.toLocaleString('id-ID')}\n` +
        `╰──────────────────`
      );
    }

    // ═══════════════════════════════════════════════════════════
    // .upgradeallstats player
    // ═══════════════════════════════════════════════════════════
    if (!user.class) return replyalya(`❌ *Kamu belum punya Class!*\n\nPilih dulu: *${prefix}selectclass*`);

    const startLvl = user.duelLvl || 0;
    const MAX_LEVEL = PlayerLevel.MAX_LEVEL || 999;

    if (startLvl >= MAX_LEVEL) {
      return replyalya(`👑 *Level kamu sudah di puncak (${MAX_LEVEL})!* Tidak bisa naik lagi.`);
    }

    const costExpFirst = PlayerLevel.classXpNeeded ? PlayerLevel.classXpNeeded(startLvl) : (startLvl + 1) * 20000;
    if ((user.exp || 0) < costExpFirst) {
      return replyalya(
        `✨ *UPGRADE ALL STATS: PLAYER*\n\n` +
        `📊 Level Saat Ini: ${startLvl}\n` +
        `📈 Butuh: ${costExpFirst.toLocaleString('id-ID')} EXP buat naik 1 level\n` +
        `💠 EXP Kamu: ${(user.exp || 0).toLocaleString('id-ID')}\n\n` +
        `_Kumpulkan EXP dari menang *${prefix}duel*, *${prefix}dungeon*, atau *${prefix}mining*!_`
      );
    }

    // Pakai levelFromExp (closed-loop, efisien) alih-alih while-loop manual —
    // penting karena curve baru bisa butuh sampai milyaran XP di level tinggi.
    const result = PlayerLevel.levelFromExp
      ? PlayerLevel.levelFromExp(user.exp || 0, startLvl)
      : { level: startLvl, leftoverExp: user.exp || 0 };

    const curLvl = Math.min(MAX_LEVEL, result.level);
    const levelUps = curLvl - startLvl;
    user.exp = result.leftoverExp;
    user.duelLvl = curLvl;

    const bonus = getBonus(user);
    await alya.sendMessage(m.chat, { react: { text: '🆙', key: m.key } });
    return replyalya(
      `╭─「 🚀 *UPGRADE ALL STATS: PLAYER* 」\n│\n` +
      `│ 👤 ${pushname || sender.split('@')[0]}\n│\n` +
      `│ 🆙 Level naik: ${startLvl} ➜ ${curLvl} (+${levelUps})\n` +
      `│ ❤️ Bonus HP: +${bonus.hp}\n` +
      `│ ⚔️ Bonus DMG: +${bonus.dmg}\n` +
      `│ 💠 Sisa EXP: ${user.exp.toLocaleString('id-ID')}\n` +
      `╰──────────────────`
    );
  }
};
