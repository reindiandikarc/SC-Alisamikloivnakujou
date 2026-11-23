// Plugin: upgradestats
// Commands: upgradestats
// Alya V20 — Upgrade satu kali percobaan per panggilan command
// .upgradestats weapon  -> latih weapon yang sedang di-equip (pakai lib/weapons.js, konsisten dgn upgradeweapon.js)
// .upgradestats player  -> naik level class/player (duelLvl), pakai user.exp global (sama seperti versi lama,
//                          exp didapat dari .duel / .dungeon / .mining), formula: (curLvl+1)*20000 exp per level
'use strict';

let W = {};
try { W = require('../../lib/weapons'); } catch (e) {
  console.error('[upgradestats] gagal load lib/weapons.js:', e.message);
}

let PlayerLevel = {};
try { PlayerLevel = require('../../lib/playerlevel'); } catch (e) {
  console.error('[upgradestats] gagal load lib/playerlevel.js:', e.message);
}

// Cost weapon disamakan dengan upgradeweapon.js biar tidak ada 2 harga berbeda utk hal yang sama
const WEAPON_XP_PER_TRY = 35;
const WEAPON_COST_PER_TRY = 75000;

// Formula bonus & XP dipusatkan di lib/playerlevel.js (JANGAN duplikat formula di sini lagi)
const getBonus = (u) => {
  const lvl = parseInt(u.duelLvl) || 0;
  return PlayerLevel.getClassBonus ? PlayerLevel.getClassBonus(lvl) : { hp: lvl * 2, dmg: Math.round(lvl * 0.4) };
};

module.exports = {
  command: ['upgradestats'],
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
        `➤ *${prefix}upgradestats weapon* — latih weapon yang sedang di-equip (Rp ${WEAPON_COST_PER_TRY.toLocaleString('id-ID')}/coba)\n` +
        `➤ *${prefix}upgradestats player* — naik level class pakai EXP (dari menang duel/dungeon/mining)\n\n` +
        `_Mau langsung naik sebanyak-banyaknya sesuai stok EXP/uang? Coba *${prefix}upgradeallstats weapon* atau *${prefix}upgradeallstats player*_`
      );
    }

    if (!global.db.users) global.db.users = {};
    if (!global.db.users[sender]) global.db.users[sender] = {};
    const userDb = global.db.users[sender];

    // ═══════════════════════════════════════════════════════════
    // .upgradestats weapon
    // ═══════════════════════════════════════════════════════════
    if (target === 'weapon') {
      if (!W.getWeaponById) return replyalya('❌ Sistem weapon belum siap, hubungi owner!');

      const weaponId = userDb.equippedWeapon;
      if (!weaponId || !userDb.weapons?.[weaponId]) {
        return replyalya(
          `❌ *Kamu belum equip weapon apapun!*\n\n` +
          `Equip dulu: *${prefix}equipweapon <id_weapon>*\n` +
          `Belum punya weapon? Tarik gacha: *${prefix}gachaweapon*`
        );
      }

      const base = W.getWeaponById(weaponId);
      if (!base) return replyalya(`❌ Data weapon *${weaponId}* tidak dikenali.`);

      const wData = userDb.weapons[weaponId];
      const currentLvl = wData.level || 1;
      const needed = W.xpNeeded(currentLvl);

      if ((userDb.money || 0) < WEAPON_COST_PER_TRY) {
        return replyalya(
          `💸 Dompet tipis! Butuh *Rp ${WEAPON_COST_PER_TRY.toLocaleString('id-ID')}* buat latihan weapon.\n` +
          `Saldo sekarang: Rp ${(userDb.money || 0).toLocaleString('id-ID')}`
        );
      }

      userDb.money -= WEAPON_COST_PER_TRY;
      wData.xp = (wData.xp || 0) + WEAPON_XP_PER_TRY;

      let leveledUp = false;
      if (wData.xp >= needed) {
        wData.xp -= needed;
        wData.level = currentLvl + 1;
        leveledUp = true;
      }

      const rarityColor = W.RARITY[base.rarity]?.color || '⚪';
      const newLvl = wData.level || 1;
      const newNeeded = W.xpNeeded(newLvl);
      const effNew = W.getEffectiveWeaponStats(weaponId, newLvl);
      const barLen = 10;
      const pct = Math.min(barLen, Math.round((wData.xp / newNeeded) * barLen));
      const bar = '▰'.repeat(pct) + '▱'.repeat(barLen - pct);

      let caption =
        `╭─「 🆙 *UPGRADE STATS: WEAPON* 」\n│\n` +
        `│ ${rarityColor} *${base.name}* (${base.rarity})\n│\n`;

      caption += leveledUp
        ? `│ 🎉 *LEVEL UP!* ${currentLvl} ➜ ${newLvl}\n│ ⚔️ DMG sekarang: +${effNew.effectiveDmg}\n│\n`
        : `│ ✨ +${WEAPON_XP_PER_TRY} XP didapat.\n│\n`;

      caption +=
        `│ 📊 *Level:* ${newLvl}\n` +
        `│ 📈 *XP:* ${wData.xp}/${newNeeded}\n` +
        `│ ${bar}\n` +
        `│ 💰 *Sisa Saldo:* Rp ${userDb.money.toLocaleString('id-ID')}\n` +
        `╰──────────────────\n\n` +
        `_Ulangi *${prefix}upgradestats weapon* buat lanjut, Rp ${WEAPON_COST_PER_TRY.toLocaleString('id-ID')}/percobaan._`;

      await alya.sendMessage(m.chat, { react: { text: leveledUp ? '🆙' : '✨', key: m.key } });
      return replyalya(caption);
    }

    // ═══════════════════════════════════════════════════════════
    // .upgradestats player  (logic asli dipertahankan, cuma dirapikan)
    // ═══════════════════════════════════════════════════════════
    if (!user.class) return replyalya(`❌ *Kamu belum punya Class!*\n\nPilih dulu: *${prefix}selectclass*`);

    const curLvl = user.duelLvl || 0;
    const MAX_LEVEL = PlayerLevel.MAX_LEVEL || 999;
    if (curLvl >= MAX_LEVEL) {
      return replyalya(`👑 *Level kamu sudah di puncak (${MAX_LEVEL})!* Tidak bisa naik lagi.`);
    }
    const costExp = PlayerLevel.classXpNeeded ? PlayerLevel.classXpNeeded(curLvl) : (curLvl + 1) * 20000;

    if ((user.exp || 0) < costExp) {
      return replyalya(
        `✨ *UPGRADE STATS: PLAYER*\n\n` +
        `📊 Level Saat Ini: ${curLvl}\n` +
        `📈 Butuh: ${costExp.toLocaleString('id-ID')} EXP\n` +
        `💠 EXP Kamu: ${(user.exp || 0).toLocaleString('id-ID')}\n\n` +
        `_Kumpulkan EXP dari menang *${prefix}duel*, *${prefix}dungeon*, atau *${prefix}mining*!_`
      );
    }

    user.exp -= costExp;
    user.duelLvl = curLvl + 1;

    const bonus = getBonus(user);
    await alya.sendMessage(m.chat, { react: { text: '🆙', key: m.key } });
    return replyalya(
      `✅ *UPGRADE BERHASIL!*\n\n` +
      `👤 ${pushname || sender.split('@')[0]}\n` +
      `📊 Level: *${user.duelLvl}*\n` +
      `❤️ Bonus HP: +${bonus.hp}\n` +
      `⚔️ Bonus DMG: +${bonus.dmg}\n` +
      `💠 Sisa EXP: ${user.exp.toLocaleString('id-ID')}\n\n` +
      `_Ulangi *${prefix}upgradestats player* kalau EXP masih cukup._`
    );
  }
};
