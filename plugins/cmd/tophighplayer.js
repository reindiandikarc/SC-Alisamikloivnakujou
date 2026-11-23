// Plugin: tophighplayer
// Commands: tophighplayer, topplayer, toppower
// Alya V20 — Leaderboard player TERKUAT, dinilai dari kombinasi:
//   Level Diri Sendiri (duelLvl) + Level Weapon yang di-equip
// Menampilkan HP & Attack tambahan dari weapon, total kemampuan keseluruhan (Power Score),
// dan efek/skill spesial weapon yang dipakai.
'use strict';

let W = {};
try { W = require('../../lib/weapons'); } catch (e) {
  console.error('[tophighplayer] gagal load lib/weapons.js:', e.message);
}

let PlayerLevel = {};
try { PlayerLevel = require('../../lib/playerlevel'); } catch (e) {
  console.error('[tophighplayer] gagal load lib/playerlevel.js:', e.message);
}

if (!global._ALYA_CLASSES) {
  global._ALYA_CLASSES = {
    warrior:  { name: 'Warrior',  emoji: '⚔️', hp: 380, mana: 100, dmg: 25, skillDmg: 45, crit: 0.15 },
    mage:     { name: 'Mage',     emoji: '🔮', hp: 310, mana: 220, dmg: 15, skillDmg: 75, crit: 0.10 },
    assassin: { name: 'Assassin', emoji: '🗡️', hp: 325, mana: 100, dmg: 32, skillDmg: 55, crit: 0.38 },
    tank:     { name: 'Tank',     emoji: '🛡️', hp: 850, mana:  80, dmg: 18, skillDmg: 30, crit: 0.05 }
  };
}
const CLASSES = global._ALYA_CLASSES;

// Formula bonus dipusatkan di lib/playerlevel.js (JANGAN duplikat formula di sini lagi)
const getBonus = (user) => {
  const lvl = parseInt(user.duelLvl) || 0;
  return PlayerLevel.getClassBonus ? PlayerLevel.getClassBonus(lvl) : { hp: lvl * 2, dmg: Math.round(lvl * 0.4) };
};

const TYPE_LABEL = {
  sword: '🗡️', bow: '🏹', spear: '🔱', dagger: '🔪',
  staff: '🪄', hammer: '🔨', scythe: '⚰️', gauntlet: '🥊'
};

// ═══════════════════════════════════════════════════════════════
// HITUNG POWER SCORE per user
// Komponen:
//  - basePower   : HP class dasar + (DMG class * 10) -> nilai combat dasar dari class
//  - lvlPower    : bonus dari level diri sendiri (duelLvl) -> HP & DMG bonus getBonus() * bobot
//  - weaponPower : dari weapon yang di-equip (effective DMG, crit%, def%, level weapon)
//  - total       : basePower + lvlPower + weaponPower
// ═══════════════════════════════════════════════════════════════
function calcPlayerPower(jid, userDb) {
  const cls = CLASSES[userDb.class] || { name: 'Tanpa Class', hp: 0, dmg: 0, crit: 0, emoji: '👤' };
  const duelLvl = parseInt(userDb.duelLvl) || 0;
  const bonus = getBonus(userDb);

  const baseHp = cls.hp;
  const baseDmg = cls.dmg;
  const bonusHp = bonus.hp;
  const bonusDmg = bonus.dmg;

  const totalHp = baseHp + bonusHp;
  const totalDmg = baseDmg + bonusDmg;

  let weaponInfo = null;
  let weaponHpAdd = 0;
  let weaponDmgAdd = 0;
  let weaponPower = 0;
  let weaponLvl = 0;

  const equippedId = userDb.equippedWeapon;
  if (equippedId && userDb.weapons?.[equippedId] && W.getEffectiveWeaponStats) {
    const wData = userDb.weapons[equippedId];
    weaponLvl = wData.level || 1;
    const eff = W.getEffectiveWeaponStats(equippedId, weaponLvl);
    if (eff) {
      weaponDmgAdd = eff.effectiveDmg;
      // Weapon tidak nambah HP langsung, tapi DEF bonus disetarakan sebagai "HP efektif tambahan"
      weaponHpAdd = Math.round(totalHp * (eff.defBonus || 0));
      weaponPower =
        (eff.effectiveDmg * 8) +
        Math.round((eff.critBonus || 0) * 100) * 5 +
        Math.round((eff.defBonus || 0) * 100) * 5 +
        (weaponLvl * 10) +
        (eff.proc ? 40 : 0) +      // bonus power kalau punya proc effect
        (eff.skillName ? 30 : 0);  // bonus power kalau punya skill spesial
      weaponInfo = eff;
    }
  }

  const basePower = totalHp + (totalDmg * 10);
  const lvlPower = duelLvl * 20;
  const totalPower = basePower + lvlPower + weaponPower;

  return {
    jid, userDb, cls,
    duelLvl, totalHp, totalDmg,
    weaponInfo, weaponHpAdd, weaponDmgAdd, weaponLvl, weaponPower,
    totalPower,
  };
}

module.exports = {
  command: ['tophighplayer', 'topplayer', 'toppower'],
  tags: ['game'],
  run: async (alya, m, ctx) => {
    const {
      command, args, prefix,
      reply, replyalya, replytolak,
      sender, pushname
    } = ctx;

    if (!global.db?.users || !Object.keys(global.db.users).length) {
      return replyalya('❌ Belum ada data player di database!');
    }

    // Cuma hitung user yang sudah punya class (biar relevan buat ranking kekuatan duel)
    const candidates = Object.entries(global.db.users)
      .filter(([jid, u]) => u && u.class && CLASSES[u.class]);

    if (!candidates.length) {
      return replyalya('❌ Belum ada player yang punya Class! Pilih dulu lewat *.selectclass*');
    }

    const ranked = candidates
      .map(([jid, u]) => calcPlayerPower(jid, u))
      .sort((a, b) => b.totalPower - a.totalPower);

    const LIMIT = 10;
    const isNumber = (v) => v && !isNaN(parseInt(v));
    const page = isNumber(args[0]) ? Math.max(1, parseInt(args[0])) : 1;
    const maxPage = Math.ceil(ranked.length / LIMIT);
    const safePage = Math.min(page, maxPage);
    const start = (safePage - 1) * LIMIT;
    const pageData = ranked.slice(start, start + LIMIT);

    const mentionJid = [];
    const lines = pageData.map((p, i) => {
      const rank = start + i + 1;
      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
      mentionJid.push(p.jid);

      const title = p.userDb.duelTitle ? ` 👑 _${p.userDb.duelTitle}_` : '';
      let weaponBlock;
      if (p.weaponInfo) {
        const rarityColor = W.RARITY?.[p.weaponInfo.rarity]?.color || '⚪';
        const typeIcon = TYPE_LABEL[p.weaponInfo.type] || '⚔️';
        let effectLine = '';
        if (p.weaponInfo.proc) {
          effectLine = `\n      💫 Efek: ${p.weaponInfo.proc.desc} _(±${Math.round(p.weaponInfo.proc.chance * 100)}%)_`;
        }
        if (p.weaponInfo.skillName) {
          effectLine += `\n      🌟 Skill: ${p.weaponInfo.skillName}`;
        }
        weaponBlock =
          `\n   🗡️ Weapon: ${rarityColor} ${typeIcon} *${p.weaponInfo.name}* (${p.weaponInfo.rarity}, Lv.${p.weaponLvl})\n` +
          `      +${p.weaponDmgAdd} ATK${p.weaponHpAdd > 0 ? ` | +${p.weaponHpAdd} HP efektif (shield)` : ''}` +
          effectLine;
      } else {
        weaponBlock = `\n   🗡️ Weapon: _Tangan kosong_`;
      }

      return (
        `${medal} @${p.jid.split('@')[0]}${title}\n` +
        `   🎭 ${p.cls.name} ${p.cls.emoji} | 🆙 Lv.${p.duelLvl}\n` +
        `   ❤️ HP: ${p.totalHp} | ⚔️ ATK: ${p.totalDmg}` +
        weaponBlock +
        `\n   💯 *TOTAL POWER: ${p.totalPower.toLocaleString('id-ID')}*`
      );
    }).join('\n\n');

    const myRank = ranked.findIndex(p => p.jid === sender) + 1;
    const myRankLine = myRank > 0 ? `📍 Peringkat kamu: *#${myRank}* dari ${ranked.length} player\n` : '';

    const caption =
      `╭─「 🏆 *TOP HIGH PLAYER* 」\n` +
      `│ Ranking dinilai dari: Level Diri + Level Weapon\n` +
      `│ ${myRankLine}│ 📄 Halaman ${safePage}/${maxPage}\n` +
      `╰──────────────────\n\n` +
      lines +
      `\n\n_Ketik *${prefix}${command} <halaman>* untuk lihat halaman lain._`;

    return alya.sendMessage(m.chat, { text: caption, mentions: mentionJid }, { quoted: m });
  }
};
