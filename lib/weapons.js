// lib/weapons.js
// Alya V20 — Data pool WEAPON untuk sistem .gachaweapon & .duel
// Dipakai oleh: plugins/cmd/gachaweapon.js, plugins/cmd/upgradeweapon.js, plugins/cmd/duel.js
'use strict';

// ═══════════════════════════════════════════════════════════════
// RARITY CONFIG
// Rate total harus = 1 (100%)
// buyPrice = harga beli LANGSUNG lewat .pilihweapon (pasti dapat, beda dari gacha yang untung-untungan)
//   Common jadi harga dasar, tiap naik rarity dikali 2x lipat berturut-turut.
// ═══════════════════════════════════════════════════════════════
const RARITY = {
  Common: { rate: 0.60, color: '⚪', order: 1, buyPrice: 400000 },
  Epic: { rate: 0.28, color: '💜', order: 2, buyPrice: 800000 },
  Legend: { rate: 0.10, color: '🟡', order: 3, buyPrice: 1600000 },
  Mythic: { rate: 0.02, color: '🔴', order: 4, buyPrice: 3200000 },
};

// Harga sekali tarik gacha weapon
const GACHA_PRICE = 500000;

// XP dibutuhkan naik level, mulai dari level 1 -> 2 butuh 100xp, tiap naik level dikali 2
// xpNeeded(level) = xp yg dibutuhkan untuk naik DARI level ini ke level berikutnya
function xpNeeded(level) {
  return 100 * Math.pow(2, Math.max(0, level - 1));
}

// Bonus stat dari base weapon (rarity) berdasarkan level saat ini (1..)
// Tiap level nambah 8% dari base dmg weapon (biar upgrade berasa signifikan tapi ga jomplang)
function levelMultiplier(level) {
  const lvl = Math.max(1, parseInt(level) || 1);
  return 1 + (lvl - 1) * 0.08;
}

// ═══════════════════════════════════════════════════════════════
// WEAPON POOL
// type: sword | bow | spear | dagger | staff | hammer | scythe | gauntlet
// role: tank | assassin | fighter | mage (weapon "cocok" untuk role ini,
//        tapi tetap bisa dipakai class lain - cuma ga dapet role-synergy bonus)
// dmg: base bonus damage yang ditambahkan ke damage normal
// critBonus: tambahan persen crit (0.05 = +5%)
// defBonus: pengurang damage masuk (dipakai kalau role tank)
// proc: { chance, effect, desc } — occasional proc effect khusus (Legend/Mythic)
// skillName: nama skill spesial (dipakai bareng skill/ulti class)
// ═══════════════════════════════════════════════════════════════
const WEAPONS = [
  // ───────────── COMMON (60%) ─────────────
  { id: 'pedang_karatan', name: 'Pedang Karatan', type: 'sword', role: 'fighter', rarity: 'Common', dmg: 6, critBonus: 0, defBonus: 0 },
  { id: 'busur_bambu', name: 'Busur Bambu', type: 'bow', role: 'assassin', rarity: 'Common', dmg: 5, critBonus: 0.03, defBonus: 0 },
  { id: 'tombak_kayu', name: 'Tombak Kayu Lapuk', type: 'spear', role: 'fighter', rarity: 'Common', dmg: 6, critBonus: 0, defBonus: 0 },
  { id: 'perisai_seng', name: 'Perisai Seng Bekas', type: 'hammer', role: 'tank', rarity: 'Common', dmg: 4, critBonus: 0, defBonus: 0.05 },
  { id: 'tongkat_rotan', name: 'Tongkat Rotan Dukun', type: 'staff', role: 'mage', rarity: 'Common', dmg: 5, critBonus: 0, defBonus: 0 },
  { id: 'belati_dapur', name: 'Belati Dapur Emak', type: 'dagger', role: 'assassin', rarity: 'Common', dmg: 6, critBonus: 0.04, defBonus: 0 },
  { id: 'gada_batu', name: 'Gada Batu Kali', type: 'hammer', role: 'tank', rarity: 'Common', dmg: 7, critBonus: 0, defBonus: 0.03 },
  { id: 'sabit_sawah', name: 'Sabit Sawah', type: 'scythe', role: 'fighter', rarity: 'Common', dmg: 6, critBonus: 0.02, defBonus: 0 },

  // ───────────── EPIC (28%) ─────────────
  {
    id: 'kubikiri_houcho', name: 'Kubikiribōchō', type: 'sword', role: 'fighter', rarity: 'Epic', dmg: 16, critBonus: 0.05, defBonus: 0.03,
  },
  {
    id: 'yumi_hoozuki', name: 'Yumi Hoozuki', type: 'bow', role: 'assassin', rarity: 'Epic', dmg: 15, critBonus: 0.10, defBonus: 0,
  },
  {
    id: 'gae_bolg', name: 'Gáe Bolg Tiruan', type: 'spear', role: 'fighter', rarity: 'Epic', dmg: 17, critBonus: 0.06, defBonus: 0.02,
  },
  {
    id: 'tongkat_elucidator', name: 'Tongkat Elucidator', type: 'staff', role: 'mage', rarity: 'Epic', dmg: 14, critBonus: 0.04, defBonus: 0,
  },
  {
    id: 'kunai_bertuah', name: 'Kunai Bertuah Konoha', type: 'dagger', role: 'assassin', rarity: 'Epic', dmg: 16, critBonus: 0.12, defBonus: 0,
  },
  {
    id: 'palu_yoru', name: 'Palu Yoru Raksasa', type: 'hammer', role: 'tank', rarity: 'Epic', dmg: 13, critBonus: 0, defBonus: 0.08,
  },
  {
    id: 'sabit_kokushibou', name: 'Sabit Kokushibō', type: 'scythe', role: 'assassin', rarity: 'Epic', dmg: 16, critBonus: 0.08, defBonus: 0,
  },
  {
    id: 'sarung_tinju_baji', name: 'Sarung Tinju Baji Naga', type: 'gauntlet', role: 'fighter', rarity: 'Epic', dmg: 15, critBonus: 0.05, defBonus: 0.03,
  },

  // ───────────── LEGEND (10%) — punya proc + skill spesial ─────────────
  {
    id: 'kusanagi_no_tsurugi', name: 'Kusanagi no Tsurugi', type: 'sword', role: 'fighter', rarity: 'Legend',
    dmg: 30, critBonus: 0.10, defBonus: 0.05,
    proc: { chance: 0.20, effect: 'bleed', value: 18, desc: 'melukai lawan hingga berdarah' },
    skillName: 'Totsuka no Tsurugi: Cabikan Naga',
  },
  {
    id: 'zabimaru', name: 'Zabimaru', type: 'sword', role: 'assassin', rarity: 'Legend',
    dmg: 28, critBonus: 0.16, defBonus: 0,
    proc: { chance: 0.22, effect: 'bleed', value: 16, desc: 'gigitan ular tulang belakang berdarah' },
    skillName: 'Higa Zekkō: Gigitan Ular Baboon',
  },
  {
    id: 'yumi_yoichi', name: 'Yumi Yoichi Tak Meleset', type: 'bow', role: 'assassin', rarity: 'Legend',
    dmg: 27, critBonus: 0.20, defBonus: 0,
    proc: { chance: 0.25, effect: 'stun', value: 1, desc: 'menembus titik lemah hingga lawan sempoyongan' },
    skillName: 'Panah Seribu Bintang',
  },
  {
    id: 'gungnir', name: 'Gungnir Sang Petir', type: 'spear', role: 'fighter', rarity: 'Legend',
    dmg: 31, critBonus: 0.10, defBonus: 0.04,
    proc: { chance: 0.20, effect: 'stun', value: 1, desc: 'sambaran petir membuat lawan kesetrum kaku' },
    skillName: 'Tombak Petir Valhalla',
  },
  {
    id: 'tongkat_elric', name: 'Tongkat Elric Sang Alkemis', type: 'staff', role: 'mage', rarity: 'Legend',
    dmg: 26, critBonus: 0.08, defBonus: 0,
    proc: { chance: 0.22, effect: 'manaburn', value: 20, desc: 'transmutasi menyedot mana lawan' },
    skillName: 'Transmutasi Api Merah',
  },
  {
    id: 'palu_mjolnir_tiruan', name: 'Palu Raksasa Mjolnir Tiruan', type: 'hammer', role: 'tank', rarity: 'Legend',
    dmg: 24, critBonus: 0.04, defBonus: 0.14,
    proc: { chance: 0.20, effect: 'stun', value: 1, desc: 'gebukan menggetarkan tanah hingga lawan oleng' },
    skillName: 'Hantaman Guruh Bumi',
  },
  {
    id: 'sabit_ryuk', name: 'Sabit Shinigami Ryuk', type: 'scythe', role: 'assassin', rarity: 'Legend',
    dmg: 29, critBonus: 0.14, defBonus: 0,
    proc: { chance: 0.20, effect: 'lifesteal', value: 0.3, desc: 'mencuri nyawa lawan seperti Death Note berjalan' },
    skillName: 'Catatan Kematian: Sabit Jiwa',
  },
  {
    id: 'sarung_tinju_baki', name: 'Sarung Tinju Baji Petinju Neraka', type: 'gauntlet', role: 'fighter', rarity: 'Legend',
    dmg: 27, critBonus: 0.10, defBonus: 0.06,
    proc: { chance: 0.20, effect: 'lifesteal', value: 0.25, desc: 'setiap hantaman menyerap tenaga lawan' },
    skillName: 'Combo Neraka: Seribu Pukulan',
  },

  // ───────────── MYTHIC (2%) — proc lebih kuat + skill dahsyat ─────────────
  {
    id: 'muramasa_terkutuk', name: 'Muramasa Sang Terkutuk', type: 'sword', role: 'assassin', rarity: 'Mythic',
    dmg: 48, critBonus: 0.25, defBonus: 0.05,
    proc: { chance: 0.30, effect: 'bleed', value: 35, desc: 'kutukan pedang membuat lawan berdarah parah' },
    skillName: 'Bankai: Tebasan Iblis Muramasa',
  },
  {
    id: 'sword_of_promised_victory', name: 'Excalibur Sang Pedang Suci', type: 'sword', role: 'fighter', rarity: 'Mythic',
    dmg: 50, critBonus: 0.18, defBonus: 0.10,
    proc: { chance: 0.28, effect: 'stun', value: 1, desc: 'kilau cahaya suci membutakan lawan sesaat' },
    skillName: 'Excalibur: Cahaya Kemenangan',
  },
  {
    id: 'yumi_kaguya', name: 'Yumi Kaguya Sang Rembulan', type: 'bow', role: 'assassin', rarity: 'Mythic',
    dmg: 46, critBonus: 0.30, defBonus: 0,
    proc: { chance: 0.32, effect: 'stun', value: 1, desc: 'anak panah cahaya bulan melumpuhkan lawan' },
    skillName: 'Panah Purnama Terlarang',
  },
  {
    id: 'longinus', name: 'Tombak Longinus Sang Suci', type: 'spear', role: 'fighter', rarity: 'Mythic',
    dmg: 49, critBonus: 0.20, defBonus: 0.08,
    proc: { chance: 0.30, effect: 'manaburn', value: 40, desc: 'tusukan suci menghanguskan cadangan mana lawan' },
    skillName: 'Tombak Suci: Tusukan Takdir',
  },
  {
    id: 'elucidator_dark_repulser', name: 'Elucidator & Dark Repulser', type: 'sword', role: 'fighter', rarity: 'Mythic',
    dmg: 47, critBonus: 0.22, defBonus: 0.06,
    proc: { chance: 0.28, effect: 'lifesteal', value: 0.35, desc: 'dual blade menyedot HP lawan dalam sekejap' },
    skillName: 'Starburst Stream',
  },
  {
    id: 'tongkat_elder', name: 'Tongkat Tetua Semesta', type: 'staff', role: 'mage', rarity: 'Mythic',
    dmg: 44, critBonus: 0.15, defBonus: 0.05,
    proc: { chance: 0.32, effect: 'manaburn', value: 45, desc: 'sihir purba membakar seluruh mana lawan' },
    skillName: 'Kiamat Sihir: Genesis Blast',
  },
  {
    id: 'mjolnir_asli', name: 'Mjolnir Sang Petir Asli', type: 'hammer', role: 'tank', rarity: 'Mythic',
    dmg: 42, critBonus: 0.10, defBonus: 0.20,
    proc: { chance: 0.30, effect: 'stun', value: 1, desc: 'petir dewa membuat lawan lumpuh total' },
    skillName: 'Murka Asgard: Petir Penghakiman',
  },
  {
    id: 'sabit_hades', name: 'Sabit Hades Sang Penguasa Maut', type: 'scythe', role: 'assassin', rarity: 'Mythic',
    dmg: 48, critBonus: 0.24, defBonus: 0,
    proc: { chance: 0.30, effect: 'lifesteal', value: 0.4, desc: 'jiwa lawan tersedot masuk dunia bawah' },
    skillName: 'Gerbang Maut: Panen Jiwa',
  },
];

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// Roll rarity berdasarkan RARITY.rate
function rollRarity() {
  const rand = Math.random();
  let cumulative = 0;
  const order = ['Common', 'Epic', 'Legend', 'Mythic'];
  for (const r of order) {
    cumulative += RARITY[r].rate;
    if (rand <= cumulative) return r;
  }
  return 'Common';
}

// Ambil 1 weapon random dari rarity tertentu
function rollWeapon() {
  const rarity = rollRarity();
  const pool = WEAPONS.filter(w => w.rarity === rarity);
  const picked = pool[Math.floor(Math.random() * pool.length)];
  return picked;
}

function getWeaponById(id) {
  return WEAPONS.find(w => w.id === id) || null;
}

// Harga beli langsung (.pilihweapon) berdasarkan rarity weapon
function getBuyPrice(rarity) {
  return RARITY[rarity]?.buyPrice || RARITY.Common.buyPrice;
}

// Semua weapon dalam 1 rarity tertentu (dipakai buat listing .pilihweapon)
function getWeaponsByRarity(rarity) {
  return WEAPONS.filter(w => w.rarity === rarity);
}

// Hitung stat efektif weapon di level tertentu
function getEffectiveWeaponStats(weaponId, level) {
  const base = getWeaponById(weaponId);
  if (!base) return null;
  const mult = levelMultiplier(level);
  return {
    ...base,
    effectiveDmg: Math.round(base.dmg * mult),
    level: Math.max(1, parseInt(level) || 1),
  };
}

// Role-synergy: jika class user cocok dengan role weapon, dapat bonus tambahan 15%
function getRoleSynergyMultiplier(userClass, weaponRole) {
  if (!userClass || !weaponRole) return 1;
  return userClass === weaponRole ? 1.15 : 1;
}

module.exports = {
  RARITY,
  GACHA_PRICE,
  WEAPONS,
  xpNeeded,
  levelMultiplier,
  rollRarity,
  rollWeapon,
  getWeaponById,
  getBuyPrice,
  getWeaponsByRarity,
  getEffectiveWeaponStats,
  getRoleSynergyMultiplier,
};
