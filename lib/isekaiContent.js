// lib/isekaiContent.js
// Alya V20 — Data konten sistem petualangan idle (explore/dungeon/quest/craft/boss)
// Tema mengikuti lib/isekaiOrigin.js (dunia fantasy generik: warrior/mage/assassin/
// tank, desa2 macam Alderwood/Brightfen, dst) — BUKAN Tensura/anime spesifik lain,
// supaya konsisten dengan universe yang sudah dibangun di .loginisekai.
//
// Diadaptasi dari konsep "SC MD" (explore/dungeon/quest harian/craft/boss raid)
// tapi di-reskin total + reward dikalibrasi ulang supaya nyambung wajar ke kurva
// XP lib/playerlevel.js (level awal cuma butuh ~1.000-1.400 XP/level, BUKAN
// ratusan-ribu seperti sumber aslinya).
'use strict';

// ── LOKASI EKSPLORASI ───────────────────────────────────────────────────────
const EXPLORE_LOCATIONS = [
  '🌲 Hutan Alderwood', '⛰️ Pegunungan Frosthollow', '🌋 Gunung Cindermoor',
  '🏛️ Reruntuhan Kuno Duskhaven', '🌊 Danau Everglow', '🏰 Kastil Terbengkalai Greymist',
  '🌑 Gua Kegelapan Hollowbrook', '☁️ Dataran Tinggi Brightfen', '🌸 Taman Peri Tersembunyi',
  '🏯 Benteng Perbatasan', '🌀 Celah Dimensi Misterius', '🐉 Sarang Naga Tua',
];

const EXPLORE_FINDS = [
  'Kristal Mana ✨', 'Herba Langka 🌿', 'Rune Kuno 📜', 'Inti Elemental 🔵',
  'Sisik Naga 🐉', 'Batu Roh 💠', 'Relik Pahlawan ⚔️', 'Bijih Ajaib 🪨',
  'Ramuan Kuno 🧪', 'Peta Harta Karun 🗺️', 'Pecahan Armor 🛡️', 'Pecahan Pedang Rune ⚔️',
];

// ── DUNGEON (scaling berdasarkan duelLvl, bukan level flat SC) ────────────
// threshold = duelLvl minimum supaya dungeon ini "wajar" ditantang (bukan hard-lock,
// cuma dipakai buat milih tier dungeon yang cocok dengan kekuatan user saat ini)
const DUNGEONS = [
  { name: '🕸️ Labirin Laba-laba',      boss: 'Ratu Laba-laba Raksasa', threshold: 0,   xp: 150,  money: 15000,  crystal: 1 },
  { name: '⛰️ Gua Orc',                boss: 'Kepala Suku Orc Geld',    threshold: 15,  xp: 350,  money: 35000,  crystal: 2 },
  { name: '🌑 Dungeon Bayangan',        boss: 'Bayangan Iblis',          threshold: 30,  xp: 700,  money: 70000,  crystal: 3 },
  { name: '🔥 Gunung Berapi',           boss: 'Raksasa Api Ifrit',       threshold: 60,  xp: 1400, money: 140000, crystal: 5 },
  { name: '❄️ Istana Es',              boss: 'Naga Es Purba',           threshold: 100, xp: 2500, money: 250000, crystal: 8 },
  { name: '👑 Singgasana Iblis',        boss: 'Bayangan Raja Iblis',     threshold: 200, xp: 4500, money: 450000, crystal: 12 },
];

// ── QUEST HARIAN ────────────────────────────────────────────────────────────
const DAILY_QUESTS = [
  { task: 'Kalahkan 3 Goblin liar di Hutan Alderwood', xp: 300, money: 25000, crystal: 1 },
  { task: 'Kumpulkan 5 Herba Langka dari Pegunungan Frosthollow', xp: 400, money: 40000, crystal: 1 },
  { task: 'Bantu warga desa membangun rumah baru', xp: 200, money: 20000, crystal: 0 },
  { task: 'Patroli keliling perbatasan desa', xp: 150, money: 15000, crystal: 0 },
  { task: 'Jelajahi Reruntuhan Kuno dan kembali dengan selamat', xp: 600, money: 60000, crystal: 2 },
  { task: 'Latihan tanding bersama sesama petualang', xp: 350, money: 30000, crystal: 1 },
  { task: 'Selesaikan misi diplomatik ke desa tetangga', xp: 800, money: 80000, crystal: 2 },
];

// ── PATROL (aktivitas ringan, cooldown pendek) ─────────────────────────────
const PATROL_EVENTS = [
  { msg: 'Menangkap basah pencuri di pasar!', xp: 60, money: 12000 },
  { msg: 'Mengusir sekawanan goblin nakal!', xp: 50, money: 9000 },
  { msg: 'Menyelamatkan warga dari monster kecil!', xp: 90, money: 18000 },
  { msg: 'Patroli aman, tidak ada ancaman berarti.', xp: 30, money: 6000 },
  { msg: 'Menemukan artefak tua terkubur di tanah!', xp: 120, money: 30000 },
];

// ── BOSS RAID (koperatif, butuh anggota grup lain yang juga terdaftar) ────
const RAID_BOSSES = [
  'Naga Badai Purba 🐉', 'Raksasa Api Abadi 🔥', 'Naga Jahat Berkarat 🟢',
  'Avatar Kehancuran 💥', 'Leviathan Lautan Dalam 🌊', 'Pasukan Boneka Sang Dalang 🎭',
];

// ── CRAFTING ─────────────────────────────────────────────────────────────
const CRAFT_POTION_COST = 15000; // money
const CRAFT_WEAPON_CRYSTAL_COST = 3;
const CRAFT_ARMOR_CRYSTAL_COST = 4;
const CRAFT_GOLEM_MONEY_COST = 100000;
const CRAFT_GOLEM_CRYSTAL_COST = 8;

const CRAFT_WEAPON_NAMES = [
  'Pedang Rune ⚔️', 'Bilah Badai ⚡', 'Busur Beku ❄️', 'Belati Bayangan 🌑',
  'Tombak Suci ✨', 'Lance Naga 🐉', 'Tongkat Kekacauan 🌀', 'Palu Petir ⚡',
];
const CRAFT_ARMOR_NAMES = [
  'Zirah Roh 🛡️', 'Jubah Bayangan 🌑', 'Perisai Naga 🐉', 'Mantel Elemental ✨',
];
const CRAFT_GOLEM_NAMES = [
  'Golem Badai ⚡', 'Golem Besi 🔩', 'Golem Kristal 💎', 'Golem Bayangan 🌑', 'Golem Api 🔥',
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
  EXPLORE_LOCATIONS, EXPLORE_FINDS,
  DUNGEONS, DAILY_QUESTS, PATROL_EVENTS, RAID_BOSSES,
  CRAFT_POTION_COST, CRAFT_WEAPON_CRYSTAL_COST, CRAFT_ARMOR_CRYSTAL_COST,
  CRAFT_GOLEM_MONEY_COST, CRAFT_GOLEM_CRYSTAL_COST,
  CRAFT_WEAPON_NAMES, CRAFT_ARMOR_NAMES, CRAFT_GOLEM_NAMES,
  pickRandom,
};
