// lib/isekaiOrigin.js
// Alya V20 — Sistem Kelahiran & Golongan Isekai
// Dipakai oleh: plugins/cmd/loginisekai.js, plugins/cmd/selectclass.js (cek unlock title),
//               plugins/cmd/guild.js (opsional flavor)
//
// GOLONGAN / TITLE:
//   Warga Desa -> lahir tanpa class, harus pilih sendiri via .pilihclass
//   Pendekar   -> sudah handle class 'warrior'
//   Penyihir   -> sudah handle class 'mage'
//   Ninja      -> sudah handle class 'assassin'
//   Guardian   -> sudah handle class 'tank'
//   Sage       -> menguasai 2 class (dari 4 class dasar)
//   Pahlawan   -> menguasai SEMUA (4) class dasar
//
// BIRTH CHANCE (dipakai HANYA saat .loginisekai / bikin karakter baru):
//   80% -> Warga Desa biasa (harus pilih class sendiri lewat .pilihclass)
//   18% -> Sage (langsung lahir dengan 2 class terbuka & level start 499, siap tempur)
//    2% -> Pahlawan (langsung lahir dengan SEMUA class terbuka & level start 999, siap tempur)
'use strict';

const CLASS_TITLE_MAP = {
  warrior: 'Pendekar',
  mage: 'Penyihir',
  assassin: 'Ninja',
  tank: 'Guardian'
};

const ALL_CLASS_KEYS = ['warrior', 'mage', 'assassin', 'tank'];

const SAGE_UNLOCK_LEVEL = 499;
const PAHLAWAN_UNLOCK_LEVEL = 999;

// ── NAMA ORANG TUA (flavor generator, dipakai .loginisekai) ───────────────
const FATHER_NAMES = [
  'Arden Wolfheart', 'Baron Reinhardt', 'Cassius Sword', 'Dorian Falkenrath',
  'Eldric Stonebreaker', 'Faust Vayne', 'Gideon Ashborne', 'Heinrich Drake',
  'Ivan Nightsworn', 'Jorah Emberlyn', 'Kael Stormwind', 'Leonhart Vermillion'
];
const MOTHER_NAMES = [
  'Aria Silverleaf', 'Beatrix Moonshade', 'Celestine Hollow', 'Diana Frostmere',
  'Elysia Duskwhisper', 'Freya Starfall', 'Giselle Thornwood', 'Helena Wintermoor',
  'Isolde Brightwater', 'Juniper Lysandra', 'Katarina Everdawn', 'Lira Nightbloom'
];

const VILLAGE_NAMES = [
  'Desa Alderwood', 'Desa Brightfen', 'Desa Cindermoor', 'Desa Duskhaven',
  'Desa Everglow', 'Desa Frosthollow', 'Desa Greymist', 'Desa Hollowbrook'
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateParents() {
  return {
    father: pickRandom(FATHER_NAMES),
    mother: pickRandom(MOTHER_NAMES),
    village: pickRandom(VILLAGE_NAMES)
  };
}

// ── BIRTH ROLL ──────────────────────────────────────────────────────────
// Return: { golongan: 'warga'|'sage'|'pahlawan', classes: [...], startLevel }
function rollBirth() {
  const roll = Math.random() * 100;
  if (roll < 2) {
    // 2% -> Pahlawan: semua class, level 999
    return { golongan: 'pahlawan', classes: [...ALL_CLASS_KEYS], startLevel: PAHLAWAN_UNLOCK_LEVEL };
  }
  if (roll < 20) {
    // 18% -> Sage: 2 class random, level 499
    const shuffled = [...ALL_CLASS_KEYS].sort(() => Math.random() - 0.5);
    const twoClasses = shuffled.slice(0, 2);
    return { golongan: 'sage', classes: twoClasses, startLevel: SAGE_UNLOCK_LEVEL };
  }
  // 80% -> Warga Desa: belum ada class sama sekali
  return { golongan: 'warga', classes: [], startLevel: 0 };
}

// ── TITLE RESOLUTION ────────────────────────────────────────────────────
// unlockedClasses = array class key yang sudah "dikuasai" (bukan cuma dipakai skrg,
// tapi pernah di-unlock permanen -> disimpan di userDb.unlockedClasses)
function resolveTitle(unlockedClasses, duelLvl) {
  const owned = Array.isArray(unlockedClasses) ? unlockedClasses.filter(c => ALL_CLASS_KEYS.includes(c)) : [];
  const lvl = parseInt(duelLvl) || 0;
  const uniqueOwned = [...new Set(owned)];

  if (uniqueOwned.length >= 4 && lvl >= PAHLAWAN_UNLOCK_LEVEL) {
    return { title: 'Pahlawan', emoji: '👑', maxed: true, classCount: 4 };
  }
  if (uniqueOwned.length >= 2 && lvl >= SAGE_UNLOCK_LEVEL) {
    return { title: 'Sage', emoji: '📖', maxed: false, classCount: uniqueOwned.length };
  }
  if (uniqueOwned.length === 1) {
    return { title: CLASS_TITLE_MAP[uniqueOwned[0]], emoji: classEmoji(uniqueOwned[0]), maxed: false, classCount: 1 };
  }
  if (uniqueOwned.length >= 2) {
    // sudah kuasai 2+ class tapi level belum cukup buat gelar Sage resmi
    return { title: 'Warga Desa (calon Sage)', emoji: '👤', maxed: false, classCount: uniqueOwned.length, pendingSage: true };
  }
  return { title: 'Warga Desa', emoji: '👤', maxed: false, classCount: 0 };
}

function classEmoji(classKey) {
  const map = { warrior: '⚔️', mage: '🔮', assassin: '🗡️', tank: '🛡️' };
  return map[classKey] || '❓';
}

// Cek apakah title BARU saja unlock (dipanggil dari selectclass.js setelah update unlockedClasses)
// Return pesan notifikasi unlock jika level & jumlah class sudah cukup, else null
function checkTitleUnlockNotif(unlockedClasses, duelLvl) {
  const info = resolveTitle(unlockedClasses, duelLvl);
  if (info.title === 'Pahlawan') {
    return (
      `╭─「 👑 *TITLE BARU: PAHLAWAN!* 」\n` +
      `│\n` +
      `│ Kamu telah menguasai SELURUH class dasar\n` +
      `│ dan mencapai level ${PAHLAWAN_UNLOCK_LEVEL}!\n` +
      `│\n` +
      `│ 🔓 Semua atribut class kini terbuka penuh.\n` +
      `│ 📌 Level class kamu terkunci PERMANEN di puncak (${PAHLAWAN_UNLOCK_LEVEL}).\n` +
      `│ ⚡ Kamu kini bisa menguasai segala hal sebagai Pahlawan sejati!\n` +
      `╰──────────────────`
    );
  }
  if (info.title === 'Sage') {
    return (
      `╭─「 📖 *TITLE BARU: SAGE!* 」\n` +
      `│\n` +
      `│ Kamu telah menguasai 2 class berbeda\n` +
      `│ dan mencapai level ${SAGE_UNLOCK_LEVEL}!\n` +
      `│\n` +
      `│ 🔓 Atribut kedua class kini bisa dipakai bergantian.\n` +
      `│ Terus berkembang untuk mengejar gelar Pahlawan!\n` +
      `╰──────────────────`
    );
  }
  return null;
}

module.exports = {
  CLASS_TITLE_MAP,
  ALL_CLASS_KEYS,
  SAGE_UNLOCK_LEVEL,
  PAHLAWAN_UNLOCK_LEVEL,
  generateParents,
  rollBirth,
  resolveTitle,
  classEmoji,
  checkTitleUnlockNotif,
  pickRandom
};
