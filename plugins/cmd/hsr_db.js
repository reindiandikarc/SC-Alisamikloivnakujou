// ═══════════════════════════════════════════════════════
//  hsr_db.js — Honkai: Star Rail Database Helper
//  Alya V13 Plugin System
//  Handles: User data init, save, read, validate
// ═══════════════════════════════════════════════════════

'use strict';

const { CHARACTERS, TRAILBLAZER, STARTER_CHARACTERS } = require('./hsr_data');

// ── KEY untuk global.db ────────────────────────────────
const DB_KEY = 'hsr';

// ── INISIALISASI USER DATA ─────────────────────────────
/**
 * Ambil data HSR user. Jika belum ada, kembalikan null.
 * @param {string} userId - WA sender JID
 * @returns {object|null}
 */
function getUser(userId) {
  if (!global.db) return null;
  if (!global.db.game) global.db.game = {};
  if (!global.db.game[DB_KEY]) global.db.game[DB_KEY] = {};
  return global.db.game[DB_KEY][userId] || null;
}

/**
 * Buat user baru dengan data default HSR.
 * @param {string} userId
 * @param {string} displayName
 * @param {string} trailblazerName - nama karakter Trailblazer player
 * @returns {object} user data
 */
function createUser(userId, displayName, trailblazerName = 'Trailblazer') {
  if (!global.db.game) global.db.game = {};
  if (!global.db.game[DB_KEY]) global.db.game[DB_KEY] = {};

  const now = Date.now();
  const userData = {
    // ── Meta ──────────────────────────────────────
    userId,
    displayName,
    trailblazerName,
    createdAt: now,
    lastActive: now,

    // ── Progression ───────────────────────────────
    trailblazeLv: 1,
    trailblazeExp: 0,
    equilibriumLv: 0,    // World Level

    // ── Resources ─────────────────────────────────
    stellarJade: 300,    // bonus awal
    credits: 100000,
    trailblazePower: 240,
    lastTPRegen: now,
    trailblazeExpItem: 0,

    // ── Gacha ─────────────────────────────────────
    warp: {
      standard: {
        pulls: 0,
        pity5: 0,
        pity4: 0,
      },
      character: {
        pulls: 0,
        pity5: 0,
        pity4: 0,
        guaranteed: false,  // jika true: pull 5★ berikutnya pasti featured
      },
    },

    // ── Characters ────────────────────────────────
    // { [charKey]: { level, eidolon, ascension, energy } }
    characters: {
      Trailblazer: {
        level: 1,
        ascension: 0,
        eidolon: 0,
        energy: 0,
        hp: TRAILBLAZER.baseHP,
        maxHp: TRAILBLAZER.baseHP,
        isTrailblazer: true,
      },
    },

    // ── Party (maks 4 slot) ────────────────────────
    party: ['Trailblazer'],     // key dari characters

    // ── Combat State ──────────────────────────────
    // null saat tidak dalam pertarungan
    combat: null,

    // ── Stats (ringkasan) ─────────────────────────
    stats: {
      totalBattles: 0,
      wins: 0,
      losses: 0,
      escapes: 0,
      enemiesDefeated: 0,
      totalWarps: 0,
    },

    // ── Flags ─────────────────────────────────────
    tutorialDone: false,
    starterPicked: false,
  };

  global.db.game[DB_KEY][userId] = userData;
  return userData;
}

/**
 * Simpan perubahan user data ke global.db.
 * (Di Alya V13, global.db auto-persist oleh core, jadi cukup mutasi objek)
 */
function saveUser(userId, data) {
  if (!global.db.game) global.db.game = {};
  if (!global.db.game[DB_KEY]) global.db.game[DB_KEY] = {};
  global.db.game[DB_KEY][userId] = data;
}

// ── RESOURCE HELPERS ───────────────────────────────────

/**
 * Regen Trailblaze Power (1 per 6 menit, max 240)
 */
function regenTP(user) {
  const MAX_TP = 240;
  const REGEN_INTERVAL_MS = 6 * 60 * 1000; // 6 menit
  const now = Date.now();
  const elapsed = now - (user.lastTPRegen || now);
  const regenAmount = Math.floor(elapsed / REGEN_INTERVAL_MS);
  if (regenAmount > 0) {
    user.trailblazePower = Math.min(MAX_TP, (user.trailblazePower || 0) + regenAmount);
    user.lastTPRegen = now - (elapsed % REGEN_INTERVAL_MS);
  }
  return user;
}

/**
 * Hitung waktu sampai TP full
 */
function timeUntilTPFull(user) {
  const MAX_TP = 240;
  if (user.trailblazePower >= MAX_TP) return '✅ Penuh!';
  const remaining = MAX_TP - user.trailblazePower;
  const ms = remaining * 6 * 60 * 1000;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}j ${m}m`;
}

// ── CHARACTER HELPERS ──────────────────────────────────

/**
 * Tambah karakter ke koleksi user.
 * Jika sudah punya, tambah eidolon (max E6).
 */
function addCharacter(user, charKey) {
  const charData = CHARACTERS[charKey] || (charKey === 'Trailblazer' ? TRAILBLAZER : null);
  if (!charData) return { success: false, msg: 'Karakter tidak ditemukan.' };

  if (user.characters[charKey]) {
    // Sudah punya → tambah eidolon
    if (user.characters[charKey].eidolon >= 6) {
      // Eidolon max, konversi ke kredit
      const bonus = charData.rarity === 5 ? 5000 : 1500;
      user.credits += bonus;
      return { success: true, isDupe: true, eidolonFull: true, bonus, charData };
    }
    user.characters[charKey].eidolon += 1;
    return { success: true, isDupe: true, newEidolon: user.characters[charKey].eidolon, charData };
  }

  // Karakter baru
  user.characters[charKey] = {
    level: 1,
    ascension: 0,
    eidolon: 0,
    energy: 0,
    hp: charData.baseHP,
    maxHp: charData.baseHP,
  };
  return { success: true, isDupe: false, charData };
}

/**
 * Set party user (validasi semua karakter ada di koleksi)
 * @param {object} user
 * @param {string[]} partyKeys - array key karakter, max 4
 * @returns {{ success, msg }}
 */
function setParty(user, partyKeys) {
  if (!Array.isArray(partyKeys) || partyKeys.length === 0) {
    return { success: false, msg: 'Party tidak boleh kosong.' };
  }
  if (partyKeys.length > 4) {
    return { success: false, msg: 'Party maksimal 4 karakter.' };
  }
  for (const key of partyKeys) {
    if (!user.characters[key]) {
      return { success: false, msg: `Kamu belum punya karakter *${key}*! Cek koleksimu dulu.` };
    }
  }
  user.party = partyKeys;
  return { success: true };
}

/**
 * Hitung stat karakter berdasarkan level + ascension
 */
function calcStat(charKey, charSave) {
  const base = CHARACTERS[charKey] || TRAILBLAZER;
  if (!base) return null;

  // Skala sederhana: tiap level naik, stat +0.8% dari base
  const lvMult = 1 + (charSave.level - 1) * 0.008;
  // Ascension bonus
  const ascBonus = [0, 0.08, 0.16, 0.24, 0.32, 0.40, 0.50][charSave.ascension] || 0;
  const total = 1 + lvMult - 1 + ascBonus;

  return {
    hp:  Math.floor(base.baseHP  * total),
    atk: Math.floor(base.baseATK * total),
    def: Math.floor(base.baseDEF * total),
    spd: Math.floor(base.baseSPD * (1 + (charSave.ascension * 0.02))),
    maxEnergy: base.baseEnergy || 120,
  };
}

// ── COMBAT HELPERS ─────────────────────────────────────

/**
 * Init combat state baru untuk user.
 * @param {object} user
 * @param {object} enemyData - dari ENEMIES
 * @param {string} enemyKey
 * @returns {object} combatState
 */
function initCombat(user, enemyData, enemyKey) {
  // Build party members dengan stat saat ini
  const party = user.party.map(charKey => {
    const save = user.characters[charKey];
    const stat = calcStat(charKey, save);
    const base = CHARACTERS[charKey] || TRAILBLAZER;
    return {
      key: charKey,
      name: base.name,
      element: base.element,
      path: base.path,
      rarity: base.rarity,
      level: save.level,
      hp: save.hp ?? stat.hp,    // HP sisa saat ini
      maxHp: stat.hp,
      atk: stat.atk,
      def: stat.def,
      spd: stat.spd,
      energy: save.energy || 0,
      maxEnergy: stat.maxEnergy,
      sp: 0,                     // SP individual (tracking per-member)
      statusEffects: [],
      isAlive: true,
      skills: base.skills,
    };
  });

  // Hitung DEF musuh berdasarkan level & type (mencegah NaN di calcDamage)
  const enemyDefByType = { basic: 80, elite: 200, boss: 400 };
  const enemyBaseLevel = enemyData.level || 20;
  const enemyDef = (enemyDefByType[enemyData.type] || 80) + enemyBaseLevel * 5;

  const combat = {
    enemyKey,
    enemy: {
      name: enemyData.name,
      type: enemyData.type,
      hp: enemyData.hp,
      maxHp: enemyData.hp,
      def: enemyDef,                 // ✅ FIX: enemy sekarang punya DEF → calcDamage tidak NaN
      level: enemyBaseLevel,         // ✅ FIX: enemy level untuk referensi
      atk: Math.floor(50 + enemyData.hp * 0.04), // ✅ base ATK enemy
      toughness: enemyData.toughness,
      maxToughness: enemyData.toughness,
      weaknesses: enemyData.weaknesses,
      statusEffects: [],
      isWeaknessBreoken: false,
      skills: enemyData.skills,
      currentSkillIdx: 0,
      energy: 0,
      maxEnergy: 100,
      phase: 1,
    },
    party,
    sp: 3,              // Skill Points bersama (max 5, start 3)
    maxSp: 5,
    turn: 1,
    actionOrder: [],    // urutan giliran berdasarkan SPD
    currentActorIdx: 0,
    currentActor: null, // party member yang sedang giliran
    log: [],            // log pertarungan
    startedAt: Date.now(),
    phase: 'player_turn', // 'player_turn' | 'enemy_turn' | 'end'
    rewards: null,
  };

  // Hitung action order awal berdasarkan SPD
  combat.actionOrder = sortActionOrder(party);
  combat.currentActor = combat.actionOrder[0];

  return combat;
}

/**
 * Sort party berdasarkan SPD untuk action order
 */
function sortActionOrder(party) {
  return [...party]
    .filter(m => m.isAlive)
    .sort((a, b) => b.spd - a.spd)
    .map(m => m.key);
}

/**
 * Hitung damage serangan
 * @param {object} attacker - party member atau enemy
 * @param {number} dmgMult - pengali damage dari skill
 * @param {object} target - target
 * @param {boolean} isWeaknessHit - apakah element match weakness
 * @returns {{ damage, isCrit, toughnessReduction }}
 */
function calcDamage(attacker, dmgMult, target, isWeaknessHit = false) {
  const baseDmg = (attacker.atk || 100) * (dmgMult || 1);

  // DEF mitigation — guard NaN: enemy mungkin tidak punya .def
  const attackerLevel = attacker.level || 1;
  const targetDef = target.def || 0;
  const defMit = targetDef > 0
    ? targetDef / (targetDef + 200 + attackerLevel * 10)
    : 0;
  let dmg = baseDmg * (1 - defMit);

  // Weakness bonus (30% extra)
  if (isWeaknessHit) dmg *= 1.3;

  // Crit (base 5%)
  const isCrit = Math.random() < 0.05;
  if (isCrit) dmg *= 1.5;

  // Random variance ±10%
  dmg *= 0.9 + Math.random() * 0.2;
  dmg = Math.max(1, Math.floor(dmg));

  // Toughness reduction
  const toughnessReduction = isWeaknessHit ? 30 : 10;

  return { damage: dmg, isCrit, toughnessReduction };
}

/**
 * Cek apakah elemen attacker merupakan weakness target
 */
function isWeaknessMatch(attackerElement, targetWeaknesses) {
  if (!targetWeaknesses || !Array.isArray(targetWeaknesses)) return false;
  return targetWeaknesses.includes(attackerElement);
}

/**
 * Apply damage ke target, cek toughness break & defeat
 */
function applyDamage(target, damage, toughnessReduction = 0) {
  target.hp = Math.max(0, target.hp - damage);

  if (target.toughness !== undefined) {
    target.toughness = Math.max(0, target.toughness - toughnessReduction);
    if (target.toughness === 0 && !target.isWeaknessBreoken) {
      target.isWeaknessBreoken = true;
    }
  }

  if (target.hp <= 0) {
    target.isAlive = false;
  }

  return target;
}

/**
 * Hitung rewards setelah menang
 */
function calcRewards(enemyData, partySize) {
  const baseCredits = enemyData.drops?.credits || [100, 200];
  const credits = Math.floor(baseCredits[0] + Math.random() * (baseCredits[1] - baseCredits[0]));
  const exp = enemyData.drops?.exp || 50;
  const material = enemyData.drops?.material || null;

  return { credits, exp, material };
}

/**
 * Apply experience ke trailblazer level
 */
function applyExp(user, exp) {
  // Tabel EXP per level (sederhana)
  const expTable = [
    0, 240, 560, 1000, 1600, 2400, 3400, 4600, 6000, 7600,
    9400, 11400, 13800, 16400, 19200, 22200, 25600, 29400, 33600, 38200,
    43200, 48800, 54800, 61200, 68000, 75200, 82800, 90800, 99200, 108000,
    117200, 126800, 136800, 147200, 158000, 169200, 180800, 192800, 205400, 218400,
    232000, 246000, 260400, 275200, 290400, 306000, 322000, 338400, 355200, 372400,
    390000, 408000, 426400, 445200, 464400, 484000, 504000, 524400, 545200, 566400,
    588000,
  ];

  user.trailblazeExp = (user.trailblazeExp || 0) + exp;
  let leveled = false;

  while (
    user.trailblazeLv < 60 &&
    user.trailblazeExp >= (expTable[user.trailblazeLv] || Infinity)
  ) {
    user.trailblazeExp -= expTable[user.trailblazeLv];
    user.trailblazeLv += 1;
    leveled = true;
  }

  return { leveled, newLevel: user.trailblazeLv };
}

// ── DISPLAY HELPERS ────────────────────────────────────

/**
 * HP bar visual
 */
function hpBar(current, max, length = 10) {
  const ratio = Math.max(0, Math.min(1, current / max));
  const filled = Math.round(ratio * length);
  const empty = length - filled;
  const color = ratio > 0.6 ? '🟩' : ratio > 0.3 ? '🟨' : '🟥';
  return color.repeat(filled) + '⬛'.repeat(empty);
}

/**
 * Toughness bar visual
 */
function toughnessBar(current, max, length = 8) {
  const ratio = Math.max(0, Math.min(1, current / max));
  const filled = Math.round(ratio * length);
  const empty = length - filled;
  return '🔶'.repeat(filled) + '⬛'.repeat(empty);
}

/**
 * Energy bar visual
 */
function energyBar(current, max, length = 10) {
  if (max === 0) return '⬛'.repeat(length);
  const ratio = Math.max(0, Math.min(1, current / max));
  const filled = Math.round(ratio * length);
  const empty = length - filled;
  return '🔵'.repeat(filled) + '⬛'.repeat(empty);
}

/**
 * Format stat dasar karakter
 */
function formatCharCard(charKey, charSave) {
  const base = CHARACTERS[charKey] || TRAILBLAZER;
  if (!base) return '❌ Data karakter tidak ditemukan';

  const stat = calcStat(charKey, charSave);
  const stars = '⭐'.repeat(base.rarity);
  const { PATH, ELEMENT } = require('./hsr_data');

  return (
    `┌─────────────────────────┐\n` +
    `│ ${stars} *${base.name}*\n` +
    `│ 🛤️ ${PATH[base.path] || base.path}\n` +
    `│ ${ELEMENT[base.element] || base.element}\n` +
    `│ Lv.${charSave.level} | E${charSave.eidolon}\n` +
    `│\n` +
    `│ ❤️ HP  : ${stat.hp.toLocaleString()}\n` +
    `│ ⚔️ ATK : ${stat.atk.toLocaleString()}\n` +
    `│ 🛡️ DEF : ${stat.def.toLocaleString()}\n` +
    `│ 💨 SPD : ${stat.spd}\n` +
    `│ ⚡ Energy : ${charSave.energy || 0}/${stat.maxEnergy}\n` +
    `└─────────────────────────┘`
  );
}

/**
 * Format combat display (UI pertarungan)
 */
function formatCombatDisplay(combat, user) {
  const e = combat.enemy;
  const sp = combat.sp;
  const maxSp = combat.maxSp;

  let out = '';
  out += `╔═══════════════════════════╗\n`;
  out += `║ 👾 ${e.name}\n`;
  out += `║ HP: ${hpBar(e.hp, e.maxHp)} ${e.hp.toLocaleString()}/${e.maxHp.toLocaleString()}\n`;
  if (!e.isWeaknessBreoken) {
    out += `║ 🔶 ${toughnessBar(e.toughness, e.maxToughness)} (${e.toughness}/${e.maxToughness})\n`;
    out += `║ Weakness: ${e.weaknesses.join(' | ')}\n`;
  } else {
    out += `║ ⚠️ *WEAKNESS BROKEN!* ⚠️\n`;
  }
  if (e.statusEffects && e.statusEffects.length > 0) {
    out += `║ Status: ${e.statusEffects.map(s => s.icon || s.name).join(' ')}\n`;
  }
  out += `╠═══════════════════════════╣\n`;

  out += `║ ⚡ SP: ${'🟡'.repeat(sp)}${'⚫'.repeat(maxSp - sp)} (${sp}/${maxSp})\n`;
  out += `║ Turn: ${combat.turn}\n`;
  out += `╠═══════════════════════════╣\n`;
  out += `║ 🧑‍🚀 PARTY:\n`;

  for (const m of combat.party) {
    if (!m.isAlive) {
      out += `║ ❌ ${m.name} [DEFEATED]\n`;
      continue;
    }
    const isActive = m.key === combat.currentActor;
    const tag = isActive ? '▶' : '  ';
    out += `║${tag} ${m.name} (Lv${m.level})\n`;
    out += `║   HP: ${hpBar(m.hp, m.maxHp, 8)} ${m.hp}/${m.maxHp}\n`;
    out += `║   E: ${energyBar(m.energy, m.maxEnergy, 6)} ${m.energy}/${m.maxEnergy}\n`;
    if (m.statusEffects && m.statusEffects.length > 0) {
      out += `║   Status: ${m.statusEffects.map(s => s.icon || s.name).join(' ')}\n`;
    }
  }

  out += `╠═══════════════════════════╣\n`;
  out += `║ Giliran: *${getActorName(combat)}*\n`;
  out += `╚═══════════════════════════╝\n`;

  out += `\nKetik aksi:\n`;
  out += `*!hsratk* — Basic Attack (+1 SP)\n`;
  out += `*!hsrskill* — Skill (-1 SP)\n`;
  out += `*!hsrult* — Ultimate (butuh Energy penuh)\n`;
  out += `*!hsrescape* — Kabur dari pertarungan\n`;

  return out;
}

function getActorName(combat) {
  const actor = combat.party.find(m => m.key === combat.currentActor);
  return actor ? actor.name : '?';
}

// ── EXPORTS ────────────────────────────────────────────
module.exports = {
  getUser,
  createUser,
  saveUser,
  regenTP,
  timeUntilTPFull,
  addCharacter,
  setParty,
  calcStat,
  initCombat,
  sortActionOrder,
  calcDamage,
  isWeaknessMatch,
  applyDamage,
  calcRewards,
  applyExp,
  hpBar,
  toughnessBar,
  energyBar,
  formatCharCard,
  formatCombatDisplay,
  getActorName,
};
