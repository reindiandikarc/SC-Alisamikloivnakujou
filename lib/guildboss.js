// lib/guildboss.js
// Alya V20 — Sistem Boss (.tantangbos)
// Fitur SOLO player only (bukan party). Terpisah dari guild quest board.
// Dipakai oleh: plugins/cmd/tantangbos.js
//
// TIER BOSS (dari mudah -> susah): Common -> Epic -> Legend -> Mythic -> King Devil
// Requirement level MINIMAL (duelLvl) untuk bisa menantang:
//   Common     : level 10+
//   Epic       : level 50+
//   Legend     : level 100+
//   Mythic     : level 500+
//   King Devil : level 1000+
//
// Reward uang & XP naik sesuai kesulitan tier, minimal Rp2.000.000 di tier terendah
// (Common) dan terus meningkat besar di tier atas. Sama seperti guild quest, reward
// akhir juga dipengaruhi peringkat duel player (RANK_DUEL_MULTIPLIER) supaya makin
// tinggi peringkat, makin besar hasil kalahkan boss yang sama.
//
// Menang -> reward uang+exp, lalu boss tier itu masuk cooldown (grinding dibatasi).
// Kalah  -> kena penalti kecil (uang & exp berkurang sedikit) sebagai risiko,
//           TIDAK ada cooldown tambahan saat kalah (boleh coba lagi kapan saja,
//           tapi cooldown tetap berlaku kalau sebelumnya pernah menang di tier ini).
'use strict';

const path = require('path');
let PlayerLevel = {};
try { PlayerLevel = require(path.join(__dirname, 'playerlevel.js')); } catch (e) {
  console.error('[guildboss] gagal load lib/playerlevel.js:', e.message);
}

// ═══════════════════════════════════════════════════════════════
// BOSS TIER DEFINITIONS
// ═══════════════════════════════════════════════════════════════
const BOSS_TIERS = [
  {
    key: 'common', label: 'Common', emoji: '🟢', stars: 1,
    minLevel: 10,
    moneyBase: 2000000,    // lantai Rp2jt (persyaratan minimal dari spesifikasi)
    xpBase: 1500,
    winRateBase: 0.72,     // peluang menang dasar sebelum disesuaikan power player
    cooldownMs: 1 * 60 * 60 * 1000,  // 1 jam
    names: ['Goblin King Ragefang', 'Slime Raksasa Beracun', 'Orc Warlord Grimtusk', 'Serigala Hutan Terkutuk']
  },
  {
    key: 'epic', label: 'Epic', emoji: '🔵', stars: 2,
    minLevel: 50,
    moneyBase: 6000000,
    xpBase: 4000,
    winRateBase: 0.65,
    cooldownMs: 1.5 * 60 * 60 * 1000, // 1.5 jam
    names: ['Cyclops Penjaga Gerbang', 'Wyvern Api Ashwing', 'Golem Batu Purba', 'Ratu Laba-laba Hutan Gelap']
  },
  {
    key: 'legend', label: 'Legend', emoji: '🟣', stars: 3,
    minLevel: 100,
    moneyBase: 15000000,
    xpBase: 10000,
    winRateBase: 0.55,
    cooldownMs: 2 * 60 * 60 * 1000, // 2 jam
    names: ['Naga Legenda Vermillion', 'Ksatria Hitam Terkutuk', 'Phoenix Abu Keabadian', 'Leviathan Penguasa Lautan']
  },
  {
    key: 'mythic', label: 'Mythic', emoji: '🟠', stars: 4,
    minLevel: 500,
    moneyBase: 35000000,
    xpBase: 30000,
    winRateBase: 0.45,
    cooldownMs: 2.5 * 60 * 60 * 1000, // 2.5 jam
    names: ['Titan Mitos Penghancur Dunia', 'Dewa Perang Jatuh Kronos', 'Naga Mitos Berkepala Sembilan', 'Malaikat Maut Berkabut Hitam']
  },
  {
    key: 'kingdevil', label: 'King Devil', emoji: '🔴', stars: 5,
    minLevel: 1000,
    moneyBase: 80000000,
    xpBase: 75000,
    winRateBase: 0.35,
    cooldownMs: 3 * 60 * 60 * 1000, // 3 jam
    names: ['King Devil Asmodeus Sang Penguasa Neraka', 'Iblis Agung Belphegor Pemakan Jiwa', 'Raja Iblis Lucival Pemusnah Peradaban']
  }
];

function getTier(key) {
  return BOSS_TIERS.find(t => t.key === key) || null;
}

function getTierIndex(key) {
  return BOSS_TIERS.findIndex(t => t.key === key);
}

// Reward money/xp: base tier x multiplier rank duel player (sama skema seperti guild quest),
// TIDAK di-clamp ke plafon 50jt guild quest karena boss memang dirancang lebih besar,
// tapi tetap dijamin minimal moneyBase tier tsb (lantai Rp2jt di tier Common).
function calcBossReward(tierKey, duelRankKey = 'E') {
  const tier = getTier(tierKey);
  if (!tier) return null;
  let mult = 1;
  if (PlayerLevel.RANK_TIERS) {
    const rankMultMap = { WARGA: 1, E: 1, D: 1.15, C: 1.3, B: 1.45, A: 1.6, S: 2.2, SS: 3, SSR: 4 };
    mult = rankMultMap[duelRankKey] || 1;
  }
  const money = Math.max(tier.moneyBase, Math.round(tier.moneyBase * mult));
  const xp = Math.max(tier.xpBase, Math.round(tier.xpBase * mult));
  return { money, xp };
}

// Penalti kalah: kecil, sekadar risiko — 3% uang saat ini (min Rp50rb, max Rp1jt) & sebagian kecil exp.
function calcLoseePenalty(currentMoney) {
  const money = Math.min(1000000, Math.max(50000, Math.round((currentMoney || 0) * 0.03)));
  const exp = 100;
  return { money, exp };
}

function pickBossName(tier) {
  return tier.names[Math.floor(Math.random() * tier.names.length)];
}

// ═══════════════════════════════════════════════════════════════
// DB helpers — cooldown & riwayat kemenangan disimpan per-user di global.db.guildBoss
// ═══════════════════════════════════════════════════════════════
function ensureBossDb() {
  if (!global.db) global.db = {};
  if (!global.db.guildBoss) global.db.guildBoss = {};
  return global.db.guildBoss;
}

function ensureUserBossData(jid) {
  const db = ensureBossDb();
  if (!db[jid]) {
    db[jid] = {
      cooldowns: {},   // { [tierKey]: timestampBolehLagi }
      wins: {},        // { [tierKey]: jumlahMenang }
      losses: {}       // { [tierKey]: jumlahKalah }
    };
  }
  if (!db[jid].cooldowns) db[jid].cooldowns = {};
  if (!db[jid].wins) db[jid].wins = {};
  if (!db[jid].losses) db[jid].losses = {};
  return db[jid];
}

function getCooldownRemaining(jid, tierKey) {
  const data = ensureUserBossData(jid);
  const until = data.cooldowns[tierKey] || 0;
  return Math.max(0, until - Date.now());
}

function setCooldown(jid, tierKey) {
  const tier = getTier(tierKey);
  if (!tier) return;
  const data = ensureUserBossData(jid);
  data.cooldowns[tierKey] = Date.now() + tier.cooldownMs;
}

function recordWin(jid, tierKey) {
  const data = ensureUserBossData(jid);
  data.wins[tierKey] = (data.wins[tierKey] || 0) + 1;
  setCooldown(jid, tierKey);
}

function recordLoss(jid, tierKey) {
  const data = ensureUserBossData(jid);
  data.losses[tierKey] = (data.losses[tierKey] || 0) + 1;
  // Kalah TIDAK menambah cooldown baru — player boleh coba lagi langsung
  // (kecuali masih ada cooldown lama dari kemenangan sebelumnya di tier yang sama).
}

// ═══════════════════════════════════════════════════════════════
// ELIGIBILITY CHECK
// ═══════════════════════════════════════════════════════════════
function checkEligibility(jid, tierKey, duelLvl) {
  const tier = getTier(tierKey);
  if (!tier) return { ok: false, reason: 'notfound' };

  const lvl = parseInt(duelLvl) || 0;
  if (lvl < tier.minLevel) {
    return { ok: false, reason: 'level', needLevel: tier.minLevel, haveLevel: lvl };
  }

  const remaining = getCooldownRemaining(jid, tierKey);
  if (remaining > 0) {
    return { ok: false, reason: 'cooldown', remainingMs: remaining };
  }

  return { ok: true };
}

// ═══════════════════════════════════════════════════════════════
// BATTLE RESOLUTION
// Win chance dasar dari tier, disesuaikan sedikit oleh selisih level player
// di atas minLevel tier (biar makin jauh di atas syarat minimal, makin gampang menang),
// tapi tetap di-cap supaya tidak jadi 100% pasti menang / 100% pasti kalah.
// ═══════════════════════════════════════════════════════════════
function resolveBattle(tierKey, duelLvl) {
  const tier = getTier(tierKey);
  const lvl = parseInt(duelLvl) || 0;
  const overLevel = Math.max(0, lvl - tier.minLevel);
  // tiap 20 level di atas syarat minimal, +1% win chance, cap total bonus +20%
  const bonus = Math.min(0.20, Math.floor(overLevel / 20) * 0.01);
  const winChance = Math.min(0.92, Math.max(0.15, tier.winRateBase + bonus));
  const won = Math.random() < winChance;
  return { won, winChance };
}

module.exports = {
  BOSS_TIERS,
  getTier,
  getTierIndex,
  calcBossReward,
  calcLoseePenalty,
  pickBossName,
  ensureBossDb,
  ensureUserBossData,
  getCooldownRemaining,
  setCooldown,
  recordWin,
  recordLoss,
  checkEligibility,
  resolveBattle
};
