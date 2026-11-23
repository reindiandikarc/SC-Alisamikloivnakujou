// lib/playerlevel.js
// Alya V20 — Sistem level CLASS/PLAYER (duelLvl), terpisah dari level WEAPON (lib/weapons.js)
// Dipakai oleh: upgradestats, upgradeallstats, setlevelclass, setclass, tophighplayer, inventory,
//               duel.js, guild.js (rank & motivasi), loginisekai.js (golongan/title)
//
// ═══════════════════════════════════════════════════════════════════════════
// REBALANCE NOTES (v2):
// - XP curve dipecah 2 fase: 1-300 (landai, 1.000 -> 99.999 XP/level) dan
//   300-1000 (curam, 100.000 -> ~1 milyar XP/level). Tujuannya level 100 gampang
//   dicapai (~236rb total XP, ~5x menang duel), tapi endgame (700-999) sangat berat
//   -> butuh sistem Boss buat percepat grinding (lihat lib/guildboss.js, menyusul).
// - Stat bonus (HP/DMG) dari duelLvl SENGAJA dikecilkan drastis dibanding versi lama
//   (lvl*15 HP / lvl*3 DMG), supaya level >100-300 nggak bikin player jomplang power.
//   Kenaikan stat besar HANYA terjadi di atas level 300. Weapon system (lib/weapons.js)
//   TIDAK diubah sama sekali sesuai request.
// ═══════════════════════════════════════════════════════════════════════════
'use strict';

const MAX_LEVEL = 999;
const PHASE_BREAK = 300; // batas fase 1 -> fase 2

// ── XP CURVE ──────────────────────────────────────────────────────────────
// Fase 1 (level 0-299): 1.000 XP -> ~99.999 XP, kenaikan ratio halus (~1.5%/level)
// Fase 2 (level 300-999): 100.000 XP -> ~1.000.000.000 XP, kenaikan ratio lebih tajam (~1.3%/level)
const PHASE1_START_XP = 1000;
const PHASE1_END_XP = 99999;
const PHASE1_RATIO = Math.pow(PHASE1_END_XP / PHASE1_START_XP, 1 / (PHASE_BREAK - 1)); // ^(1/299)

const PHASE2_START_XP = 100000;
const PHASE2_END_XP = 1000000000;
const PHASE2_STEPS = MAX_LEVEL - PHASE_BREAK; // 699
const PHASE2_RATIO = Math.pow(PHASE2_END_XP / PHASE2_START_XP, 1 / PHASE2_STEPS);

// XP dibutuhkan untuk naik DARI `level` ke `level+1`
function classXpNeeded(level) {
  const lvl = Math.max(0, Math.min(MAX_LEVEL - 1, parseInt(level) || 0));
  if (lvl < PHASE_BREAK) {
    return Math.round(PHASE1_START_XP * Math.pow(PHASE1_RATIO, lvl));
  }
  const step = lvl - PHASE_BREAK;
  return Math.round(PHASE2_START_XP * Math.pow(PHASE2_RATIO, step));
}

// Berapa level yang bisa didapat dari total exp yang sudah dipunya user (dipakai .upgradeallstats)
// Return { level, leftoverExp, nextNeeded } — level = level baru absolut (bukan delta)
function levelFromExp(totalExp, startLevel = 0) {
  let lvl = Math.max(0, parseInt(startLevel) || 0);
  let exp = Math.max(0, parseInt(totalExp) || 0);
  if (lvl >= MAX_LEVEL) return { level: MAX_LEVEL, leftoverExp: exp, nextNeeded: null };
  let needed = classXpNeeded(lvl);
  while (exp >= needed && lvl < MAX_LEVEL) {
    exp -= needed;
    lvl++;
    if (lvl >= MAX_LEVEL) { needed = null; break; }
    needed = classXpNeeded(lvl);
  }
  return { level: lvl, leftoverExp: exp, nextNeeded: needed };
}

// ── STAT BONUS CURVE ─────────────────────────────────────────────────────
// Fase 1 (0-300): kenaikan sangat landai -> HP +2/level, DMG +0.4/level
// Fase 2 (>300): kenaikan jauh lebih besar per level di atas base level 300
const PHASE1_HP_PER_LVL = 2;
const PHASE1_DMG_PER_LVL = 0.4;
const PHASE2_HP_PER_LVL = 8;
const PHASE2_DMG_PER_LVL = 2;

function getHpDmgBonus(level) {
  const lvl = Math.max(0, Math.min(MAX_LEVEL, parseInt(level) || 0));
  if (lvl <= PHASE_BREAK) {
    return {
      hp: Math.round(lvl * PHASE1_HP_PER_LVL),
      dmg: Math.round(lvl * PHASE1_DMG_PER_LVL)
    };
  }
  const baseHp = PHASE_BREAK * PHASE1_HP_PER_LVL;
  const baseDmg = Math.round(PHASE_BREAK * PHASE1_DMG_PER_LVL);
  const extra = lvl - PHASE_BREAK;
  return {
    hp: baseHp + Math.round(extra * PHASE2_HP_PER_LVL),
    dmg: baseDmg + Math.round(extra * PHASE2_DMG_PER_LVL)
  };
}

// ── DEX BONUS (kemampuan Dodge) ─────────────────────────────────────────────
// Setiap kelipatan 5 level (5, 10, 15, 20, ...) DEX bertambah +1 poin.
// DEX dipakai buat hitung persentase Dodge murni (lihat getDodgeChance di bawah).
const DEX_PER_STEP = 1;
const DEX_LEVEL_STEP = 5;

function getDexBonus(level) {
  const lvl = Math.max(0, Math.min(MAX_LEVEL, parseInt(level) || 0));
  return Math.floor(lvl / DEX_LEVEL_STEP) * DEX_PER_STEP;
}

// Konversi DEX -> persentase Dodge (dipakai duel.js supaya semua serangan lawan
// punya peluang di-dodge murni berdasar DEX, bukan cuma trigger dari "bertahan").
// Sengaja di-cap supaya nggak jadi 100% dodge di level tinggi (masih ada RNG lain).
const DODGE_PERCENT_PER_DEX = 0.005; // tiap 1 DEX = +0.5% dodge
const DODGE_CAP = 0.35; // maksimal 35% dodge murni dari DEX

function getDodgeChance(level) {
  const dex = getDexBonus(level);
  return Math.min(DODGE_CAP, dex * DODGE_PERCENT_PER_DEX);
}

// ── MANA BONUS ───────────────────────────────────────────────────────────────
// Setiap kelipatan 50 level (50, 100, 150, ...) Mana Max bertambah +50 poin.
const MANA_PER_STEP = 50;
const MANA_LEVEL_STEP = 50;

function getManaBonus(level) {
  const lvl = Math.max(0, Math.min(MAX_LEVEL, parseInt(level) || 0));
  return Math.floor(lvl / MANA_LEVEL_STEP) * MANA_PER_STEP;
}

// getClassBonus TETAP dipakai oleh semua pemanggil lama (duel, inventory, dst) —
// sekarang hasilnya diperluas dengan field `dex` dan `mana` supaya seluruh sistem
// RPG (termasuk duel) otomatis kebagian bonus baru ini tanpa perlu ubah tiap call-site.
function getClassBonus(level) {
  const base = getHpDmgBonus(level);
  return {
    hp: base.hp,
    dmg: base.dmg,
    dex: getDexBonus(level),
    mana: getManaBonus(level)
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// RANK / PERINGKAT PETUALANG (berdasarkan duelLvl)
// SSR > 999 | SS > 499 | S > 199 | A > 99 | B > 49 | C > 29 | D > 19 | E > 9 | Warga Biasa 0-9
// ═══════════════════════════════════════════════════════════════════════════
const RANK_TIERS = [
  { min: 999,  key: 'SSR', label: 'SSR', emoji: '🌈', desc: 'Legenda Hidup — nyaris menyentuh batas kekuatan tertinggi!' },
  { min: 499,  key: 'SS',  label: 'SS',  emoji: '🟥', desc: 'Petarung elit yang disegani di seluruh benua.' },
  { min: 200,  key: 'S',   label: 'S',   emoji: '🟧', desc: 'Petarung tangguh, sudah pantas disebut pahlawan lokal.' },
  { min: 100,  key: 'A',   label: 'A',   emoji: '🟨', desc: 'Petualang berpengalaman, mulai dikenal banyak guild.' },
  { min: 50,   key: 'B',   label: 'B',   emoji: '🟩', desc: 'Petualang menengah, kemampuan sudah cukup diandalkan.' },
  { min: 30,   key: 'C',   label: 'C',   emoji: '🟦', desc: 'Petualang pemula-menengah, mulai menemukan gaya bertarung.' },
  { min: 20,   key: 'D',   label: 'D',   emoji: '🟪', desc: 'Petualang baru, masih perlu banyak latihan.' },
  { min: 10,   key: 'E',   label: 'E',   emoji: '⬜', desc: 'Baru memulai perjalanan sebagai petualang.' },
  { min: 0,    key: 'WARGA', label: 'Warga Biasa', emoji: '👤', desc: 'Belum resmi jadi petualang, masih warga biasa.' }
];

// NOTE: sesuai spesifikasi user -> ">999"=SSR, ">499"=SS, "199"(diasumsikan >199)=S,
// ">99"=A, ">49"=B, ">29"=C, ">19"=D, ">9"=E, 0-9=Warga Biasa.
// Threshold di atas pakai >= (min) supaya konsisten (min = ambang bawah tier).
// SSR sengaja di-set mulai level 999 (bukan 1000) dan SS mulai level 499 (bukan 500)
// supaya golongan isekai dari lib/isekaiOrigin.js otomatis masuk tier yang sesuai
// sejak lahir: "Pahlawan" (lahir di PAHLAWAN_UNLOCK_LEVEL=999) -> SSR,
// "Sage" (lahir di SAGE_UNLOCK_LEVEL=499) -> SS.
function getRankInfo(level) {
  const lvl = Math.max(0, parseInt(level) || 0);
  for (const tier of RANK_TIERS) {
    if (lvl >= tier.min) return tier;
  }
  return RANK_TIERS[RANK_TIERS.length - 1];
}

// Guild membutuhkan minimal rank E (level >9) supaya "resmi jadi petualang".
const GUILD_MIN_LEVEL = 10;

// Pesan motivasi khusus buat yang levelnya masih di bawah syarat guild (0-9, Warga Biasa)
function getMotivationMessage(level, pushname) {
  const lvl = Math.max(0, parseInt(level) || 0);
  const name = pushname || 'Petualang';
  const remaining = Math.max(0, GUILD_MIN_LEVEL - lvl);
  return (
    `💭 *${name}*, level kamu masih *${lvl}* (Warga Biasa).\n` +
    `Guild Petualang cuma menerima mereka yang sudah membuktikan diri minimal *Rank E* (level ${GUILD_MIN_LEVEL}+).\n\n` +
    `Jangan menyerah! Tinggal ${remaining} level lagi menuju gerbang Guild.\n` +
    `Latihan lewat *duel*, selesaikan misi, dan kumpulkan EXP — setiap pertarungan kecil ` +
    `adalah langkah menuju gelar petualang sejati. Semua Pahlawan pun pernah jadi Warga Biasa dulu! 🔥`
  );
}

// Ringkasan rank lengkap dengan flavor text, dipakai buat .guild daftar & .levelinfo
function buildRankSummary(level, pushname) {
  const lvl = Math.max(0, parseInt(level) || 0);
  const tier = getRankInfo(lvl);
  const name = pushname || 'Petualang';

  if (tier.key === 'WARGA') {
    return {
      tier,
      eligible: false,
      text: `${tier.emoji} *Peringkat:* ${tier.label}\n${tier.desc}\n\n${getMotivationMessage(lvl, name)}`
    };
  }

  return {
    tier,
    eligible: true,
    text:
      `${tier.emoji} *Peringkat:* ${tier.label}\n` +
      `${tier.desc}\n\n` +
      `✅ Level kamu (*${lvl}*) memenuhi syarat untuk resmi terdaftar sebagai Petualang Guild!`
  };
}

module.exports = {
  MAX_LEVEL,
  PHASE_BREAK,
  GUILD_MIN_LEVEL,
  classXpNeeded,
  levelFromExp,
  getClassBonus,
  getHpDmgBonus,
  getDexBonus,
  getDodgeChance,
  getManaBonus,
  DEX_LEVEL_STEP,
  MANA_LEVEL_STEP,
  RANK_TIERS,
  getRankInfo,
  getMotivationMessage,
  buildRankSummary,
};
