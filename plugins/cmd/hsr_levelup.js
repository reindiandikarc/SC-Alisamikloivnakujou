// ═══════════════════════════════════════════════════════
//  hsr_levelup.js — Honkai: Star Rail | Level Up & Upgrade
//  Alya V13 Plugin System
//  Commands:
//    !hsrlevelup [char] [jumlah]  — Level up karakter
//    !hsrascend [char]            — Ascension karakter
//    !hsrskillup [char] [skill]   — Upgrade skill (basic/skill/ult/talent)
//    !hsrupgrade                  — Menu upgrade
//  Database: global.db.game.hsr[userId]
// ═══════════════════════════════════════════════════════

'use strict';

const path = require('path');
const { getUser, saveUser, calcStat } = require(path.join(__dirname, 'hsr_db'));
const { CHARACTERS, TRAILBLAZER } = require(path.join(__dirname, 'hsr_data'));

// ── HELPERS ───────────────────────────────────────────
function fmt(n) { return (n || 0).toLocaleString('id-ID'); }

function getElementIcon(elem) {
  const m = { Physical:'⚪', Fire:'🔥', Ice:'❄️', Lightning:'⚡', Wind:'🌀', Quantum:'🌌', Imaginary:'🟡' };
  return m[elem] || '❓';
}

function getPathIcon(p) {
  const m = { TheHunt:'🏹', Destruction:'💥', Erudition:'📚', Harmony:'🎵', Nihility:'🌑', Abundance:'🌿', Preservation:'🛡️', Remembrance:'🔮' };
  return m[p] || '❓';
}

// ── LEVEL UP COST TABLE ───────────────────────────────
// Cost kredit untuk naik 1 level berdasarkan tier level saat ini
function levelUpCreditCost(currentLevel) {
  if (currentLevel < 20) return 1200;
  if (currentLevel < 30) return 2000;
  if (currentLevel < 40) return 3000;
  if (currentLevel < 50) return 4500;
  if (currentLevel < 60) return 6500;
  if (currentLevel < 70) return 9000;
  return 12000;
}

// EXP yang dibutuhkan untuk naik 1 level (untuk karakter — bukan Trailblazer)
function levelUpExpCost(currentLevel) {
  if (currentLevel < 20) return 800;
  if (currentLevel < 30) return 1500;
  if (currentLevel < 40) return 3000;
  if (currentLevel < 50) return 5500;
  if (currentLevel < 60) return 9000;
  if (currentLevel < 70) return 14000;
  return 20000;
}

// ── ASCENSION DATA ────────────────────────────────────
// Level cap dan biaya ascension tiap fase
const ASCENSION_DATA = [
  { phase: 1, levelCap: 30,  creditCost: 4000,  tbLvReq: 15,  desc: 'A1 → Lv.30' },
  { phase: 2, levelCap: 40,  creditCost: 8000,  tbLvReq: 25,  desc: 'A2 → Lv.40' },
  { phase: 3, levelCap: 50,  creditCost: 16000, tbLvReq: 35,  desc: 'A3 → Lv.50' },
  { phase: 4, levelCap: 60,  creditCost: 28000, tbLvReq: 45,  desc: 'A4 → Lv.60' },
  { phase: 5, levelCap: 70,  creditCost: 44000, tbLvReq: 55,  desc: 'A5 → Lv.70' },
  { phase: 6, levelCap: 80,  creditCost: 64000, tbLvReq: 60,  desc: 'A6 → Lv.80' },
];

// Level cap berdasarkan ascension phase (0 = belum ascend = max 20)
const ASC_LEVEL_CAP = [20, 30, 40, 50, 60, 70, 80];

// ── SKILL DATA ────────────────────────────────────────
const SKILL_TYPES = ['basic', 'skill', 'ult', 'talent'];
const SKILL_NAMES = {
  basic:  '⚔️ Basic Attack',
  skill:  '🔷 Skill',
  ult:    '💫 Ultimate',
  talent: '🌟 Talent',
};

// Max level skill per tier (Lv.1~10, dengan ascension buka tier baru)
const SKILL_MAX_LEVEL = 10;

// Biaya upgrade skill per level (credit)
function skillUpgradeCost(currentSkillLevel, charRarity) {
  const rarityMult = charRarity === 5 ? 1.5 : 1.0;
  const baseCosts = [0, 2000, 4000, 8000, 14000, 22000, 32000, 44000, 58000, 76000];
  const base = baseCosts[Math.min(currentSkillLevel, 9)] || 76000;
  return Math.floor(base * rarityMult);
}

// ── FIND CHARACTER (fuzzy match) ──────────────────────
function findCharKey(user, query) {
  if (!query) return null;
  const q = query.toLowerCase().replace(/\s+/g, '');

  // Match Trailblazer
  if (['trailblazer','tb','mc'].includes(q)) return 'Trailblazer';

  // Exact match by key
  const ownedKeys = Object.keys(user.characters || {});
  const exactKey = ownedKeys.find(k => k.toLowerCase() === q);
  if (exactKey) return exactKey;

  // Partial match by name
  const partialKey = ownedKeys.find(k => {
    const base = CHARACTERS[k] || (k === 'Trailblazer' ? TRAILBLAZER : null);
    if (!base) return false;
    return base.name.toLowerCase().replace(/\s+/g, '').includes(q);
  });
  return partialKey || null;
}

// ── FORMAT STAT COMPARISON ────────────────────────────
function fmtStatCompare(charKey, save, newLevel, newAscension) {
  const oldStat = calcStat(charKey, save);
  const fakeSave = { ...save, level: newLevel, ascension: newAscension };
  const newStat = calcStat(charKey, fakeSave);

  return (
    `  ❤️ HP  : ${fmt(oldStat.hp)} → *${fmt(newStat.hp)}*\n` +
    `  ⚔️ ATK : ${fmt(oldStat.atk)} → *${fmt(newStat.atk)}*\n` +
    `  🛡️ DEF : ${fmt(oldStat.def)} → *${fmt(newStat.def)}*\n` +
    `  💨 SPD : ${oldStat.spd} → *${newStat.spd}*`
  );
}

// ── BUILD UPGRADE MENU ────────────────────────────────
function buildUpgradeMenu(user) {
  const chars = user.characters || {};
  const keys = Object.keys(chars);

  let msg = `╔══════════════════════════════╗\n`;
  msg += `║  ⬆️ MENU UPGRADE HSR         ║\n`;
  msg += `╚══════════════════════════════╝\n\n`;
  msg += `💰 *Credits kamu:* ${fmt(user.credits)} 🔵\n`;
  msg += `🎓 *Trailblaze Lv:* ${user.trailblazeLv}\n\n`;

  msg += `📋 *Karakter yang bisa di-upgrade:*\n`;

  let count = 0;
  for (const key of keys) {
    const save = chars[key];
    const base = CHARACTERS[key] || (key === 'Trailblazer' ? TRAILBLAZER : null);
    if (!base) continue;
    count++;

    const levelCap = ASC_LEVEL_CAP[save.ascension] || 80;
    const canAscend = save.ascension < 6 && save.level >= levelCap;
    const canLevel = save.level < levelCap;

    msg += `${getElementIcon(base.element)} *${base.name}* | Lv.${save.level}/${levelCap} A${save.ascension}\n`;
    if (canLevel) msg += `  📈 !hsrlevelup ${key} — Tersedia\n`;
    if (canAscend) msg += `  🔓 !hsrascend ${key} — *Bisa Ascend!*\n`;
    msg += `\n`;
  }

  if (count === 0) {
    msg += `😔 Belum ada karakter. Lakukan !hsrwarp dulu!\n`;
  }

  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `*Perintah Upgrade:*\n`;
  msg += `!hsrlevelup [char] [jumlah] — Level up\n`;
  msg += `!hsrascend [char]           — Ascension\n`;
  msg += `!hsrskillup [char] [skill]  — Upgrade skill\n\n`;
  msg += `Contoh:\n`;
  msg += `!hsrlevelup Seele 5\n`;
  msg += `!hsrascend Kafka\n`;
  msg += `!hsrskillup DanHeng skill`;

  return msg;
}

// ═══════════════════════════════════════════════════════
//  MODULE EXPORT — Plugin Format Alya V13
// ═══════════════════════════════════════════════════════
module.exports = [

  // ──────────────────────────────────────────────────
  // !hsrupgrade — Menu utama upgrade
  // ──────────────────────────────────────────────────
  {
    command: ['hsrupgrade'],
    tags: ['game'],
    run: async (alya, m, ctx) => {
      const { sender, replyalya } = ctx;
      const userId = sender;

      const user = getUser(userId);
      if (!user) return replyalya(`❌ Kamu belum terdaftar!\nKetik *!hsrregister* untuk mulai petualangan.`);

      return replyalya(buildUpgradeMenu(user));
    }
  },

  // ──────────────────────────────────────────────────
  // !hsrlevelup [char] [jumlah] — Level up karakter
  // ──────────────────────────────────────────────────
  {
    command: ['hsrlevelup'],
    tags: ['game'],
    run: async (alya, m, ctx) => {
      const { args, replyalya, sender } = ctx;
      const userId = sender;

      const user = getUser(userId);
      if (!user) return replyalya(`❌ Kamu belum terdaftar!\nKetik *!hsrregister* untuk mulai.`);

      if (user.combat) return replyalya(`⚔️ Kamu sedang dalam pertarungan!\nSelesaikan dulu dengan *!hsrescape* atau menang.`);

      const charQuery = args[0];
      if (!charQuery) return replyalya(
        `📖 *Cara Level Up:*\n` +
        `!hsrlevelup [nama karakter] [jumlah level]\n\n` +
        `Contoh:\n` +
        `!hsrlevelup Seele 3\n` +
        `!hsrlevelup Trailblazer 1\n\n` +
        `Lihat karakter kamu: *!hsrchars*\n` +
        `Menu upgrade: *!hsrupgrade*`
      );

      const charKey = findCharKey(user, charQuery);
      if (!charKey) return replyalya(
        `❌ Karakter *${charQuery}* tidak ditemukan di koleksimu!\n\n` +
        `Cek koleksi: *!hsrchars*\n` +
        `Nama harus sesuai (misal: Seele, DanHeng, Kafka, Trailblazer)`
      );

      const save = user.characters[charKey];
      const base = CHARACTERS[charKey] || (charKey === 'Trailblazer' ? TRAILBLAZER : null);
      if (!save || !base) return replyalya(`❌ Data karakter error. Coba lagi.`);

      const levelCap = ASC_LEVEL_CAP[save.ascension] || 80;

      // Cek sudah max level cap
      if (save.level >= levelCap) {
        if (save.ascension < 6) {
          return replyalya(
            `⚠️ *${base.name}* sudah mencapai level cap Lv.${levelCap}!\n\n` +
            `Lakukan *Ascension* dulu untuk melanjutkan:\n` +
            `!hsrascend ${charKey}`
          );
        } else {
          return replyalya(`🏆 *${base.name}* sudah mencapai level maksimum *Lv.80*!`);
        }
      }

      // Berapa level yang mau di-up? Default 1
      let levelsToUp = parseInt(args[1]) || 1;
      levelsToUp = Math.max(1, Math.min(levelsToUp, 10)); // Max 10 level per command

      // Batasi agar tidak melebihi level cap
      const maxPossible = levelCap - save.level;
      levelsToUp = Math.min(levelsToUp, maxPossible);

      // Hitung total biaya (tiap level beda biaya)
      let totalCreditCost = 0;
      let totalExpCost = 0;
      for (let i = 0; i < levelsToUp; i++) {
        const lvl = save.level + i;
        totalCreditCost += levelUpCreditCost(lvl);
        totalExpCost += levelUpExpCost(lvl);
      }

      // Cek credits
      if (user.credits < totalCreditCost) {
        return replyalya(
          `❌ *Credits tidak cukup!*\n\n` +
          `Level up ${levelsToUp}x *${base.name}* (Lv.${save.level} → Lv.${save.level + levelsToUp})\n` +
          `Biaya   : ${fmt(totalCreditCost)} 🔵 Credits\n` +
          `Punya   : ${fmt(user.credits)} 🔵 Credits\n` +
          `Kurang  : ${fmt(totalCreditCost - user.credits)} 🔵\n\n` +
          `Cari Credits dengan *!hsrbattle*!`
        );
      }

      // Simpan stat sebelum
      const oldStat = calcStat(charKey, save);

      // Apply level up
      const oldLevel = save.level;
      user.credits -= totalCreditCost;
      save.level += levelsToUp;

      // Update HP sesuai level baru
      const newStat = calcStat(charKey, save);
      const hpScaled = Math.floor((save.hp / oldStat.hp) * newStat.hp);
      save.hp = Math.min(newStat.hp, Math.max(save.hp, hpScaled));
      save.maxHp = newStat.hp;

      saveUser(userId, user);

      // Cek bisa ascend setelah level up
      const newLevelCap = ASC_LEVEL_CAP[save.ascension] || 80;
      const canAscendNow = save.level >= newLevelCap && save.ascension < 6;

      let msg = `╔══════════════════════════════╗\n`;
      msg += `║  ⬆️ LEVEL UP BERHASIL!        ║\n`;
      msg += `╚══════════════════════════════╝\n\n`;
      msg += `${getElementIcon(base.element)} *${base.name}* ${base.rarity === 5 ? '⭐⭐⭐⭐⭐' : '⭐⭐⭐⭐'}\n`;
      msg += `📊 Level: *${oldLevel}* → *${save.level}*/${newLevelCap}\n\n`;
      msg += `📈 *Peningkatan Stats:*\n`;
      msg += `  ❤️ HP  : ${fmt(oldStat.hp)} → *${fmt(newStat.hp)}*\n`;
      msg += `  ⚔️ ATK : ${fmt(oldStat.atk)} → *${fmt(newStat.atk)}*\n`;
      msg += `  🛡️ DEF : ${fmt(oldStat.def)} → *${fmt(newStat.def)}*\n`;
      msg += `  💨 SPD : ${oldStat.spd} → *${newStat.spd}*\n\n`;
      msg += `💰 Credits terpakai : ${fmt(totalCreditCost)}\n`;
      msg += `💰 Sisa Credits     : ${fmt(user.credits)}\n`;

      if (canAscendNow) {
        msg += `\n✨ *${base.name}* sudah siap Ascension!\n`;
        msg += `Ketik *!hsrascend ${charKey}* untuk unlock level lebih tinggi!`;
      } else if (save.level < newLevelCap) {
        msg += `\n📌 Level cap saat ini: Lv.${newLevelCap} (A${save.ascension})`;
      }

      return replyalya(msg);
    }
  },

  // ──────────────────────────────────────────────────
  // !hsrascend [char] — Ascension karakter
  // ──────────────────────────────────────────────────
  {
    command: ['hsrascend'],
    tags: ['game'],
    run: async (alya, m, ctx) => {
      const { args, replyalya, sender } = ctx;
      const userId = sender;

      const user = getUser(userId);
      if (!user) return replyalya(`❌ Kamu belum terdaftar!\nKetik *!hsrregister* untuk mulai.`);

      if (user.combat) return replyalya(`⚔️ Selesaikan pertarungan dulu!`);

      const charQuery = args[0];
      if (!charQuery) return replyalya(
        `📖 *Cara Ascension:*\n!hsrascend [nama karakter]\n\n` +
        `Contoh: !hsrascend Seele\n\n` +
        `Karakter harus sudah mencapai level cap sebelum bisa ascend.`
      );

      const charKey = findCharKey(user, charQuery);
      if (!charKey) return replyalya(`❌ Karakter *${charQuery}* tidak ditemukan di koleksimu!\nCek: *!hsrchars*`);

      const save = user.characters[charKey];
      const base = CHARACTERS[charKey] || (charKey === 'Trailblazer' ? TRAILBLAZER : null);
      if (!save || !base) return replyalya(`❌ Data karakter error.`);

      // Sudah A6 (max ascension)?
      if (save.ascension >= 6) {
        return replyalya(`🏆 *${base.name}* sudah mencapai Ascension maksimum *(A6)*!\nLevel cap: Lv.80`);
      }

      const nextAsc = ASCENSION_DATA[save.ascension]; // ascension ke- (0-indexed)
      if (!nextAsc) return replyalya(`❌ Data ascension error.`);

      const currentLevelCap = ASC_LEVEL_CAP[save.ascension];

      // Cek syarat level (karakter harus sudah di level cap)
      if (save.level < currentLevelCap) {
        return replyalya(
          `⚠️ *${base.name}* belum bisa Ascension!\n\n` +
          `Level yang dibutuhkan : *${currentLevelCap}*\n` +
          `Level saat ini        : ${save.level}\n\n` +
          `Masih kurang ${currentLevelCap - save.level} level lagi!\n` +
          `Gunakan *!hsrlevelup ${charKey}* untuk naik level.`
        );
      }

      // Cek syarat Trailblaze Level
      if (user.trailblazeLv < nextAsc.tbLvReq) {
        return replyalya(
          `⚠️ Trailblaze Level kurang!\n\n` +
          `Dibutuhkan : Trailblaze Lv.*${nextAsc.tbLvReq}*\n` +
          `Kamu saat ini: Lv.${user.trailblazeLv}\n\n` +
          `Main *!hsrbattle* untuk dapatkan EXP Trailblaze!`
        );
      }

      // Cek credits
      if (user.credits < nextAsc.creditCost) {
        return replyalya(
          `❌ *Credits tidak cukup untuk Ascension!*\n\n` +
          `Biaya Ascension ${nextAsc.desc}: ${fmt(nextAsc.creditCost)} 🔵\n` +
          `Credits kamu : ${fmt(user.credits)} 🔵\n` +
          `Kurang       : ${fmt(nextAsc.creditCost - user.credits)} 🔵`
        );
      }

      // Simpan stat sebelum
      const oldStat = calcStat(charKey, save);
      const oldAsc = save.ascension;
      const oldLevelCap = ASC_LEVEL_CAP[oldAsc];

      // Apply ascension
      user.credits -= nextAsc.creditCost;
      save.ascension += 1;

      const newLevelCap = ASC_LEVEL_CAP[save.ascension];
      const newStat = calcStat(charKey, save);
      save.maxHp = newStat.hp;
      // HP ikut scale ascension bonus
      save.hp = Math.min(newStat.hp, Math.floor(save.hp * (newStat.hp / oldStat.hp)));

      saveUser(userId, user);

      let msg = `╔══════════════════════════════╗\n`;
      msg += `║  🔓 ASCENSION BERHASIL!       ║\n`;
      msg += `╚══════════════════════════════╝\n\n`;
      msg += `${getElementIcon(base.element)} *${base.name}*\n`;
      msg += `✨ Ascension: *A${oldAsc}* → *A${save.ascension}*\n`;
      msg += `📊 Level cap: Lv.${oldLevelCap} → *Lv.${newLevelCap}*\n\n`;
      msg += `📈 *Stat Bonus Ascension:*\n`;
      msg += `  ❤️ HP  : ${fmt(oldStat.hp)} → *${fmt(newStat.hp)}*\n`;
      msg += `  ⚔️ ATK : ${fmt(oldStat.atk)} → *${fmt(newStat.atk)}*\n`;
      msg += `  🛡️ DEF : ${fmt(oldStat.def)} → *${fmt(newStat.def)}*\n`;
      msg += `  💨 SPD : ${oldStat.spd} → *${newStat.spd}*\n\n`;
      msg += `💰 Credits terpakai : ${fmt(nextAsc.creditCost)}\n`;
      msg += `💰 Sisa Credits     : ${fmt(user.credits)}\n\n`;
      msg += `Sekarang bisa level up ke *Lv.${newLevelCap}*!\n`;
      msg += `Gunakan *!hsrlevelup ${charKey}* untuk lanjut.`;

      return replyalya(msg);
    }
  },

  // ──────────────────────────────────────────────────
  // !hsrskillup [char] [skill] — Upgrade skill karakter
  // ──────────────────────────────────────────────────
  {
    command: ['hsrskillup'],
    tags: ['game'],
    run: async (alya, m, ctx) => {
      const { args, replyalya, sender } = ctx;
      const userId = sender;

      const user = getUser(userId);
      if (!user) return replyalya(`❌ Kamu belum terdaftar!\nKetik *!hsrregister* untuk mulai.`);

      if (user.combat) return replyalya(`⚔️ Selesaikan pertarungan dulu!`);

      if (!args[0]) return replyalya(
        `📖 *Cara Upgrade Skill:*\n` +
        `!hsrskillup [karakter] [skill]\n\n` +
        `Skill yang bisa di-upgrade:\n` +
        `  basic  — Basic Attack\n` +
        `  skill  — Skill\n` +
        `  ult    — Ultimate\n` +
        `  talent — Talent\n\n` +
        `Contoh:\n` +
        `!hsrskillup Seele skill\n` +
        `!hsrskillup Kafka ult`
      );

      // Parse: args[0] = char, args[1] = skill type
      const charQuery = args[0];
      const skillType = (args[1] || '').toLowerCase();

      if (!SKILL_TYPES.includes(skillType)) {
        return replyalya(
          `❌ *Skill tidak valid!*\n\n` +
          `Pilih salah satu:\n` +
          `  basic | skill | ult | talent\n\n` +
          `Contoh: !hsrskillup Seele ult`
        );
      }

      const charKey = findCharKey(user, charQuery);
      if (!charKey) return replyalya(`❌ Karakter *${charQuery}* tidak ditemukan di koleksimu!\nCek: *!hsrchars*`);

      const save = user.characters[charKey];
      const base = CHARACTERS[charKey] || (charKey === 'Trailblazer' ? TRAILBLAZER : null);
      if (!save || !base) return replyalya(`❌ Data karakter error.`);

      // Init skill levels jika belum ada
      if (!save.skillLevels) {
        save.skillLevels = { basic: 1, skill: 1, ult: 1, talent: 1 };
      }

      const currentSkillLv = save.skillLevels[skillType] || 1;

      // Max skill level = 10, tapi butuh ascension tertentu
      const ascReqForSkillTier = { 1:0, 2:0, 3:1, 4:2, 5:3, 6:4, 7:5, 8:6, 9:6, 10:6 };
      const maxSkillLvForAsc = Object.entries(ascReqForSkillTier)
        .filter(([lvl, req]) => req <= save.ascension)
        .map(([lvl]) => parseInt(lvl));
      const maxSkillLv = Math.max(...maxSkillLvForAsc);

      if (currentSkillLv >= SKILL_MAX_LEVEL) {
        return replyalya(`🏆 ${SKILL_NAMES[skillType]} *${base.name}* sudah maksimal *(Lv.10)*!`);
      }

      if (currentSkillLv >= maxSkillLv) {
        // Butuh ascension lebih tinggi
        const neededAsc = ascReqForSkillTier[currentSkillLv + 1] || 6;
        return replyalya(
          `⚠️ Skill tidak bisa di-upgrade lebih lanjut!\n\n` +
          `${SKILL_NAMES[skillType]} saat ini: Lv.${currentSkillLv}\n` +
          `Dibutuhkan Ascension: *A${neededAsc}*\n` +
          `Ascension kamu: A${save.ascension}\n\n` +
          `Lakukan *!hsrascend ${charKey}* dulu!`
        );
      }

      // Hitung biaya
      const creditCost = skillUpgradeCost(currentSkillLv, base.rarity);

      // Cek credits
      if (user.credits < creditCost) {
        return replyalya(
          `❌ *Credits tidak cukup!*\n\n` +
          `Upgrade ${SKILL_NAMES[skillType]} ke Lv.${currentSkillLv + 1}:\n` +
          `Biaya  : ${fmt(creditCost)} 🔵 Credits\n` +
          `Punya  : ${fmt(user.credits)} 🔵 Credits\n` +
          `Kurang : ${fmt(creditCost - user.credits)} 🔵`
        );
      }

      // Apply upgrade
      user.credits -= creditCost;
      save.skillLevels[skillType] = currentSkillLv + 1;

      saveUser(userId, user);

      const skillData = base.skills[skillType];
      const newLv = save.skillLevels[skillType];

      // Hitung bonus DMG setelah upgrade (sederhana: +5% per level)
      const dmgBonus = skillData.dmgMult
        ? `📊 DMG Multiplier: ${(skillData.dmgMult * 100).toFixed(0)}% → *${(skillData.dmgMult * 100 * (1 + (newLv - 1) * 0.05)).toFixed(1)}%*`
        : `✨ Efek skill meningkat`;

      let msg = `╔══════════════════════════════╗\n`;
      msg += `║  ✨ SKILL UPGRADE BERHASIL!   ║\n`;
      msg += `╚══════════════════════════════╝\n\n`;
      msg += `${getElementIcon(base.element)} *${base.name}*\n`;
      msg += `${SKILL_NAMES[skillType]}: *${skillData.name}*\n`;
      msg += `📈 Level: *${currentSkillLv}* → *${newLv}* (Max: ${SKILL_MAX_LEVEL})\n\n`;
      msg += `${dmgBonus}\n`;
      msg += `📝 ${skillData.desc}\n\n`;
      msg += `💰 Credits terpakai : ${fmt(creditCost)}\n`;
      msg += `💰 Sisa Credits     : ${fmt(user.credits)}\n\n`;

      if (newLv < maxSkillLv) {
        const nextCost = skillUpgradeCost(newLv, base.rarity);
        msg += `➡️ Upgrade ke Lv.${newLv + 1}: ${fmt(nextCost)} 🔵\n`;
        msg += `!hsrskillup ${charKey} ${skillType}`;
      } else if (newLv >= maxSkillLv && newLv < SKILL_MAX_LEVEL) {
        const neededAsc = ascReqForSkillTier[newLv + 1] || 6;
        msg += `🔒 Butuh Ascension *A${neededAsc}* untuk lanjut`;
      } else {
        msg += `🏆 Skill sudah mencapai level maksimum!`;
      }

      return replyalya(msg);
    }
  },

  // ──────────────────────────────────────────────────
  // !hsrstatchar [char] — Lihat stat + progress karakter
  // ──────────────────────────────────────────────────
  {
    command: ['hsrstatchar'],
    tags: ['game'],
    run: async (alya, m, ctx) => {
      const { args, replyalya, sender } = ctx;
      const userId = sender;

      const user = getUser(userId);
      if (!user) return replyalya(`❌ Belum terdaftar! Ketik *!hsrregister*`);

      const charQuery = args[0];
      if (!charQuery) return replyalya(`Contoh: !hsrstatchar Seele`);

      const charKey = findCharKey(user, charQuery);
      if (!charKey) return replyalya(`❌ Karakter *${charQuery}* tidak ditemukan!\nCek koleksi: *!hsrchars*`);

      const save = user.characters[charKey];
      const base = CHARACTERS[charKey] || (charKey === 'Trailblazer' ? TRAILBLAZER : null);
      if (!save || !base) return replyalya(`❌ Data error.`);

      const stat = calcStat(charKey, save);
      const levelCap = ASC_LEVEL_CAP[save.ascension] || 80;
      const skillLevels = save.skillLevels || { basic: 1, skill: 1, ult: 1, talent: 1 };

      // Next upgrade info
      const canLevel = save.level < levelCap;
      const canAscend = save.level >= levelCap && save.ascension < 6;
      const nextLvCost = canLevel ? levelUpCreditCost(save.level) : 0;
      const nextAscData = canAscend ? ASCENSION_DATA[save.ascension] : null;

      let msg = `╔══════════════════════════════╗\n`;
      msg += `║  📊 DETAIL KARAKTER          ║\n`;
      msg += `╚══════════════════════════════╝\n\n`;
      msg += `${getElementIcon(base.element)} *${base.name}* ${base.rarity === 5 ? '⭐⭐⭐⭐⭐' : '⭐⭐⭐⭐'}\n`;
      msg += `${getPathIcon(base.path)} ${base.path} | ${base.element}\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `📈 Level    : ${save.level} / ${levelCap} (A${save.ascension})\n`;
      msg += `💫 Eidolon  : E${save.eidolon}\n\n`;

      msg += `📊 *Stats Saat Ini:*\n`;
      msg += `  ❤️ HP     : ${fmt(save.hp)} / ${fmt(stat.hp)}\n`;
      msg += `  ⚔️ ATK    : ${fmt(stat.atk)}\n`;
      msg += `  🛡️ DEF    : ${fmt(stat.def)}\n`;
      msg += `  💨 SPD    : ${stat.spd}\n`;
      msg += `  ⚡ Energy : ${save.energy || 0} / ${stat.maxEnergy}\n\n`;

      msg += `🎯 *Skill Levels:*\n`;
      msg += `  ⚔️ Basic   : Lv.${skillLevels.basic || 1}\n`;
      msg += `  🔷 Skill   : Lv.${skillLevels.skill || 1}\n`;
      msg += `  💫 Ult     : Lv.${skillLevels.ult || 1}\n`;
      msg += `  🌟 Talent  : Lv.${skillLevels.talent || 1}\n\n`;

      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      if (canLevel) {
        msg += `💡 *Bisa Level Up!*\n`;
        msg += `  Biaya per level: ${fmt(nextLvCost)} 🔵\n`;
        msg += `  !hsrlevelup ${charKey} [jumlah]\n`;
      } else if (canAscend) {
        msg += `✨ *Siap Ascension!*\n`;
        msg += `  Biaya: ${fmt(nextAscData.creditCost)} 🔵\n`;
        msg += `  !hsrascend ${charKey}\n`;
      } else {
        msg += `🏆 Level cap A${save.ascension} tercapai!\n`;
      }

      msg += `\n💰 Credits kamu: ${fmt(user.credits)} 🔵`;

      return replyalya(msg);
    }
  },

];
